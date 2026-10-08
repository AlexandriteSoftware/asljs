import { type Code,
         type Heading,
         type RootContent }
  from 'mdast';
import { getSection,
         parseMarkdown,
         plainText,
         splitLocalUrl }
  from './markdown.js';

export type LogStatus = 'Passed' | 'Failed';

export interface LogEntry
{
  time: string;
  status: LogStatus;
  note: string;
}

/**
 * What a requirement or evidence document says, read from its markdown.
 */
export interface RqDocument
{
  /**
   * The text of the level 1 heading, or `null` when there is none.
   */
  title: string | null;

  /**
   * The markdown between the level 1 heading and the first level 2 heading:
   * the statement of a requirement, the description of an evidence.
   */
  body: string;

  /**
   * Targets of the links and link definitions to local `.md` files, as
   * written, without `#` fragments and with percent-encoding decoded.
   */
  links: string[];

  /**
   * The targets, in the same form, of the links in the `## Implementation`
   * list, including references to link definitions elsewhere in the document.
   */
  implementation: string[];

  /**
   * The commands of the `## Steps` code blocks, one per non-empty line.
   */
  steps: string[];

  /**
   * The entries of the `## Log` section.
   */
  log: LogEntry[];
}

const LOG_ENTRY =
  /^(\S+)\s+(Passed|Failed)(?:\s+-\s+(.*))?$/;

export function parseDocument(
    text: string
  ): RqDocument
{
  const root =
    parseMarkdown(text);

  const title =
    root.children.find(
      (node): node is Heading =>
      node.type === 'heading'
      && node.depth === 1);

  const stepsSection =
    getSection(
      root,
      'Steps');

  const steps =
    (stepsSection ?? [ ])
    .filter(
      (node): node is Code => node.type === 'code')
    .flatMap(
      node => node.value.split(/\r?\n/))
    .map(
      line => line.trim())
    .filter(
      line => line !== '');

  const log =
    (getSection(
      root,
      'Log') ?? [ ])
    .flatMap(
      node =>
        node.type === 'list'
          ? node.children
          : [ ])
    .map(
      item =>
        parseLogEntry(
          plainText(item)))
    .filter(
      entry => entry !== null);

  return { title:
             title
      ? plainText(title)
      : null,
           body:
             getBody(
               text,
               root.children),
           links:
             getLocalLinks(root),
           implementation:
             getImplementationLinks(root),
           steps,
           log };
}

/**
 * A `## Log` list item's text as an entry: `<time> Passed|Failed[ - <note>]`
 * with a time `Date` can read; `null` for any other text.
 */
export function parseLogEntry(
    text: string
  ): LogEntry | null
{
  const match =
    LOG_ENTRY.exec(
      text.trim());

  if (
    !match
    || Number.isNaN(
      Date.parse(match[1]))
  ) {
    return null;
  }

  return { time: match[1],
           status:
             match[2] as LogStatus,
           note: match[3] ?? '' };
}

export function formatLogEntry(
    entry: LogEntry
  ): string
{
  const note =
    entry.note
    .replace(
      /\s+/g,
      ' ')
    .trim();

  return `${entry.time} ${entry.status}${
    note === ''
      ? ''
      : ` - ${note}`
  }`;
}

function getBody(
    text: string,
    nodes: RootContent[]
  ): string
{
  const titleIndex =
    nodes.findIndex(
      node =>
      node.type === 'heading'
      && node.depth === 1);

  const body: RootContent[] = [ ];

  for (const node of nodes.slice(titleIndex + 1)) {
    if (node.type === 'heading') {
      break;
    }

    if (node.type !== 'definition') {
      body.push(node);
    }
  }

  if (body.length === 0) {
    return '';
  }

  return text.slice(
    body[0].position!.start.offset,
    body[body.length - 1].position!.end.offset);
}

function getImplementationLinks(
    root: ReturnType<typeof parseMarkdown>
  ): string[]
{
  const definitions = new Map<string, string>();

  const collect =
    (
        node: RootContent | ReturnType<typeof parseMarkdown>
      ): void =>
    {
    if (node.type === 'definition') {
      definitions.set(
        node.identifier,
        node.url);
    }

    if ('children' in node) {
      node.children.forEach(collect);
    }
  };

  collect(root);

  const links: string[] = [ ];

  const visit =
    (
        node: RootContent
      ): void =>
    {
    const url =
      node.type === 'link'
      ? node.url
      : node.type === 'linkReference'
      ? definitions.get(node.identifier)
      : undefined;

    const target =
      url === undefined
      ? undefined
      : splitLocalUrl(url)?.path;

    if (
      target !== undefined
      && target.toLowerCase().endsWith('.md')
      && !links.includes(target)
    ) {
      links.push(target);
    }

    if ('children' in node) {
      node.children.forEach(visit);
    }
  };

  for (
    const node of getSection(
      root,
      'Implementation') ?? [ ]
  ) {
    if (node.type === 'list') {
      visit(node);
    }
  }

  return links;
}

function getLocalLinks(
    root: RootContent | ReturnType<typeof parseMarkdown>
  ): string[]
{
  const links: string[] = [ ];

  const visit =
    (
        node: RootContent | ReturnType<typeof parseMarkdown>
      ): void =>
    {
    if (
      node.type === 'link'
      || node.type === 'definition'
    ) {
      const target =
        splitLocalUrl(node.url)?.path;

      if (
        target !== undefined
        && target.toLowerCase().endsWith('.md')
        && !links.includes(target)
      ) {
        links.push(target);
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  visit(root);

  return links;
}
