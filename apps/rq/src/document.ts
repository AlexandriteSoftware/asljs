import { getSection,
         parseMarkdown,
         plainText,
         splitLocalUrl }
  from 'asljs-mdcli';
import { type Heading,
         type RootContent }
  from 'mdast';
import { readStatus,
         type StatusSection }
  from './status-section.js';
import { parseSteps,
         type TestStep }
  from './steps.js';

/**
 * What a requirement or test document says, read from its markdown.
 */
export interface RqDocument
{
  /**
   * The text of the level 1 heading, or `null` when there is none.
   */
  title: string | null;

  /**
   * The markdown between the level 1 heading and the first level 2 heading:
   * the statement of a requirement, the description of a test.
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
   * The steps of a test, one per `###` heading of its `## Steps` section.
   */
  steps: TestStep[];

  /**
   * What is wrong with the `## Steps` section; a test with any fails.
   */
  stepProblems: string[];

  /**
   * The `## Status` section the commands write.
   */
  status: StatusSection;
}

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

  const { steps, problems: stepProblems } =
    parseSteps(
      root,
      text);

  const { result, coverage, execution } =
    readStatus(
      root,
      text);

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
           stepProblems,
           status:
             { result,
               coverage,
               execution } };
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
