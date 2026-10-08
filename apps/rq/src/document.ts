import { type Code,
         type Heading,
         type Root,
         type RootContent }
  from 'mdast';
import remarkParse
  from 'remark-parse';
import { unified }
  from 'unified';

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
   * `evidence` when the document has a `## Steps` section.
   */
  kind: 'requirement' | 'evidence';

  /**
   * Targets of the links and link definitions to local `.md` files, as
   * written, without `#` fragments and with percent-encoding decoded.
   */
  links: string[];

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
    unified()
    .use(remarkParse)
    .parse(text) as Root;

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
        LOG_ENTRY.exec(
          plainText(item).trim()))
    .filter(
      match => match !== null)
    .map(
      match => ({ time: match[1],
                  status:
                    match[2] as LogStatus,
                  note: match[3] ?? '' }));

  return { title:
             title
      ? plainText(title)
      : null,
           kind:
             stepsSection
      ? 'evidence'
      : 'requirement',
           links:
             getLocalLinks(root),
           steps,
           log };
}

/**
 * The text with a log entry added at the end of its `## Log` section, or in a
 * `## Log` section added at the end of the document.
 */
export function appendLogEntry(
    text: string,
    entry: LogEntry
  ): string
{
  const line =
    `- ${entry.time} ${entry.status}${
    entry.note === ''
      ? ''
      : ` - ${
        entry.note.replace(
          /\s+/g,
          ' ')
      }`
  }`;

  const root =
    unified()
    .use(remarkParse)
    .parse(text) as Root;

  const section =
    getSection(
      root,
      'Log');

  if (!section) {
    return `${text.trimEnd()}\n\n## Log\n\n${line}\n`;
  }

  const heading =
    root.children.find(
      node =>
      node.type === 'heading'
      && node.depth === 2
      && plainText(node) === 'Log')!;

  const last =
    section.length > 0
    ? section[section.length - 1]
    : heading;

  const offset =
    last.position!.end.offset!;

  const separator =
    last.type === 'list'
    ? '\n'
    : '\n\n';

  const rest =
    text.slice(offset);

  return text.slice(
    0,
    offset)
    + separator
    + line
    + (rest === ''
      ? '\n'
      : rest);
}

/**
 * The nodes between a level 2 heading and the next heading of level 1 or 2.
 */
function getSection(
    root: Root,
    name: string
  ): RootContent[] | null
{
  const start =
    root.children.findIndex(
      node =>
      node.type === 'heading'
      && node.depth === 2
      && plainText(node) === name);

  if (start < 0) {
    return null;
  }

  const nodes: RootContent[] = [ ];

  for (const node of root.children.slice(start + 1)) {
    if (
      node.type === 'heading'
      && node.depth <= 2
    ) {
      break;
    }

    nodes.push(node);
  }

  return nodes;
}

function getLocalLinks(
    root: Root
  ): string[]
{
  const links: string[] = [ ];

  const visit =
    (
        node: Root | RootContent
      ): void =>
    {
    if (
      node.type === 'link'
      || node.type === 'definition'
    ) {
      const target =
        toLocalMarkdownPath(node.url);

      if (
        target !== null
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

function toLocalMarkdownPath(
    url: string
  ): string | null
{
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(url)
    || url.startsWith('//')
  ) {
    return null;
  }

  const hash =
    url.indexOf('#');

  const filePath =
    hash < 0
    ? url
    : url.slice(
      0,
      hash);

  if (!filePath.toLowerCase().endsWith('.md')) {
    return null;
  }

  try {
    return decodeURIComponent(filePath);
  } catch {
    return filePath;
  }
}

function plainText(
    node: Root | RootContent
  ): string
{
  if ('value' in node) {
    return node.value;
  }

  if ('children' in node) {
    return node.children
      .map(
        child => plainText(child))
      .join('');
  }

  return '';
}
