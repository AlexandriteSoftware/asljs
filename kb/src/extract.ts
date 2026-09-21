import { Code,
         Definition,
         Heading,
         Image,
         Link,
         LinkReference,
         ListItem,
         Node,
         Parent,
         Table,
         Text }
  from 'mdast';
import { documentLine,
         MarkdownDocument }
  from './markdown.js';

export interface ExtractedHeading
{
  level: number;
  text: string;
  slug: string;
  line: number;
}

export type LinkKind =
  | 'inline'
  | 'image'
  | 'reference'
  | 'definition'
  | 'wiki';

export interface ExtractedLink
{
  kind: LinkKind;

  /**
   * Link destination as written. For `reference` this is the definition
   * identifier rather than a path; the matching `definition` entry carries
   * the path.
   */
  target: string;

  text: string;

  line: number;

  column: number;
}

export interface ExtractedTask
{
  checked: boolean;
  text: string;
  line: number;
}

export interface ExtractedTable
{
  headers: string[];
  rows: string[][];
  line: number;
}

export interface ExtractedCodeBlock
{
  language: string;
  value: string;
  line: number;
}

const WIKI_LINK_PATTERN =
  /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * All headings of the document, in document order.
 */
export function extractHeadings(
    document: MarkdownDocument
  ): ExtractedHeading[]
{
  return collect<Heading>(
    document.root,
    'heading')
    .map(
      (
          heading
        ) =>
      {
        const text =
          toPlainText(heading);

        return { level: heading.depth,
                 text,
                 slug:
                   toSlug(text),
                 line:
                   lineOf(
                     document,
                     heading) };
      });
}

/**
 * All links of the document: inline links, images, reference links, and
 * `[[wiki links]]`.
 */
export function extractLinks(
    document: MarkdownDocument
  ): ExtractedLink[]
{
  const links: ExtractedLink[] = [ ];

  visit(
    document.root,
    (
        node
      ) =>
    {
      links.push(
        ...linksOf(
          document,
          node));
    });

  return links;
}

/**
 * The links one node carries. A text node carries as many as it holds wiki
 * links; every other kind carries one or none.
 */
function linksOf(
    document: MarkdownDocument,
    node: Node
  ): ExtractedLink[]
{
  if (node.type === 'link') {
    return [ inlineLink(
      document,
      node as Link) ];
  }

  if (node.type === 'image') {
    return [ imageLink(
      document,
      node as Image) ];
  }

  if (node.type === 'linkReference') {
    return [ referenceLink(
      document,
      node as LinkReference) ];
  }

  if (node.type === 'definition') {
    return [ definitionLink(
      document,
      node as Definition) ];
  }

  if (node.type === 'text') {
    return wikiLinks(
      document,
      node as Text);
  }

  return [ ];
}

function inlineLink(
    document: MarkdownDocument,
    link: Link
  ): ExtractedLink
{
  return { kind: 'inline',
           target: link.url,
           text:
             toPlainText(link),
           ...positionOf(
             document,
             link) };
}

function imageLink(
    document: MarkdownDocument,
    image: Image
  ): ExtractedLink
{
  return { kind: 'image',
           target: image.url,
           text: image.alt ?? '',
           ...positionOf(
             document,
             image) };
}

function referenceLink(
    document: MarkdownDocument,
    reference: LinkReference
  ): ExtractedLink
{
  return { kind: 'reference',
           target:
             reference.identifier,
           text:
             toPlainText(reference),
           ...positionOf(
             document,
             reference) };
}

function definitionLink(
    document: MarkdownDocument,
    definition: Definition
  ): ExtractedLink
{
  return { kind: 'definition',
           target: definition.url,
           text:
             definition.identifier,
           ...positionOf(
             document,
             definition) };
}

function wikiLinks(
    document: MarkdownDocument,
    text: Text
  ): ExtractedLink[]
{
  const links: ExtractedLink[] = [ ];

  for (const match of text.value.matchAll(WIKI_LINK_PATTERN)) {
    const target =
      (match[1] ?? '').trim();

    links.push(
      { kind: 'wiki',
        target,
        text:
          (match[2] ?? target).trim(),
        ...offsetPositionOf(
          document,
          text,
          match.index) });
  }

  return links;
}

/**
 * All GFM task list items of the document.
 */
export function extractTasks(
    document: MarkdownDocument
  ): ExtractedTask[]
{
  return collect<ListItem>(
    document.root,
    'listItem')
    .filter(
      item =>
      typeof item.checked === 'boolean')
    .map(
      item => ({ checked: item.checked === true,
                 text:
                   toPlainText(item),
                 line:
                   lineOf(
                     document,
                     item) }));
}

/**
 * All GFM tables of the document. The first row is reported as the header.
 */
export function extractTables(
    document: MarkdownDocument
  ): ExtractedTable[]
{
  return collect<Table>(
    document.root,
    'table')
    .map(
      (
          table
        ) =>
      {
        const rows =
          table.children.map(
            row =>
            row.children.map(toPlainText));

        return { headers:
                   rows[0] ?? [ ],
                 rows:
                   rows.slice(1),
                 line:
                   lineOf(
                     document,
                     table) };
      });
}

/**
 * All fenced and indented code blocks of the document.
 */
export function extractCodeBlocks(
    document: MarkdownDocument
  ): ExtractedCodeBlock[]
{
  return collect<Code>(
    document.root,
    'code')
    .map(
      code => ({ language: code.lang ?? '',
                 value: code.value,
                 line:
                   lineOf(
                     document,
                     code) }));
}

/**
 * Plain text of a node and of all its descendants. Inline code and formatting
 * marks are flattened; hard breaks become spaces.
 */
export function toPlainText(
    node: Node
  ): string
{
  const parts: string[] = [ ];

  visit(
    node,
    (
        current
      ) =>
    {
      if (
        current.type === 'text'
        || current.type === 'inlineCode'
      ) {
        parts.push(
          (current as Text).value);

        return;
      }

      if (
        current.type === 'break'
        || current.type === 'tableCell'
      ) {
        parts.push(' ');
      }
    });

  return parts
    .join('')
    .replace(
      /\s+/g,
      ' ')
    .trim();
}

/**
 * Convert heading text into a GitHub-style anchor slug.
 */
export function toSlug(
    text: string
  ): string
{
  return text
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      '')
    .trim()
    .replace(
      /\s+/g,
      '-');
}

function collect<TNode extends Node>(
    root: Node,
    type: string
  ): TNode[]
{
  const nodes: TNode[] = [ ];

  visit(
    root,
    (
        node
      ) =>
    {
      if (node.type === type) {
        nodes.push(
          node as TNode);
      }
    });

  return nodes;
}

function visit(
    node: Node,
    callback: (node: Node) => void
  ): void
{
  callback(node);

  const children =
    (node as Parent).children;

  if (!Array.isArray(children)) {
    return;
  }

  for (const child of children) {
    visit(
      child,
      callback);
  }
}

function lineOf(
    document: MarkdownDocument,
    node: Node
  ): number
{
  const line =
    node.position?.start.line ?? 1;

  return documentLine(
    document,
    line);
}

function positionOf(
    document: MarkdownDocument,
    node: Node
  ): { line: number; column: number; }
{
  return { line:
             lineOf(
               document,
               node),
           column:
             node.position?.start.column ?? 1 };
}

/**
 * Position of a match inside the value of a text node.
 *
 * Node positions cover the whole text node, which may span several lines, so
 * the offset of the match has to be walked. The value of a text node is the
 * decoded text, so a line holding character references or escapes can report
 * a column that is slightly short of the source column.
 */
function offsetPositionOf(
    document: MarkdownDocument,
    node: Text,
    offset: number
  ): { line: number; column: number; }
{
  const prefix =
    node.value.slice(
      0,
      offset);

  const breaks =
    prefix.split('\n');

  const start =
    node.position?.start
    ?? { line: 1,
         column: 1 };

  if (breaks.length === 1) {
    return { line:
               documentLine(
                 document,
                 start.line),
             column: start.column + offset };
  }

  return { line:
             documentLine(
               document,
               start.line + breaks.length - 1),
           column:
             (breaks[breaks.length - 1] ?? '').length + 1 };
}

export type ExtractionKind =
  | 'headings'
  | 'links'
  | 'tasks'
  | 'tables'
  | 'code'
  | 'front-matter'
  | 'all';

export const EXTRACTION_KINDS: ExtractionKind[] =
  [ 'headings',
    'links',
    'tasks',
    'tables',
    'code',
    'front-matter',
    'all' ];

/**
 * Extract one kind of structured data from a markdown document. `all` returns
 * every kind in one object.
 */
export function extractData(
    document: MarkdownDocument,
    kind: ExtractionKind
  ): unknown
{
  if (kind === 'headings') {
    return extractHeadings(document);
  }

  if (kind === 'links') {
    return extractLinks(document);
  }

  if (kind === 'tasks') {
    return extractTasks(document);
  }

  if (kind === 'tables') {
    return extractTables(document);
  }

  if (kind === 'code') {
    return extractCodeBlocks(document);
  }

  if (kind === 'front-matter') {
    return document.frontMatter.data;
  }

  if (kind === 'all') {
    return { frontMatter:
               document.frontMatter.data,
             headings:
               extractHeadings(document),
             links:
               extractLinks(document),
             tasks:
               extractTasks(document),
             tables:
               extractTables(document),
             code:
               extractCodeBlocks(document) };
  }

  throw new Error(
    `Unknown extraction kind: ${String(kind)}. Use ${
      EXTRACTION_KINDS.join(', ')}.`);
}

/**
 * Parse `value` as an extraction kind, rejecting unknown values.
 */
function asKindName(
    value: unknown
  ): string
{
  if (
    typeof value
    !== 'string'
  ) {
    return '';
  }

  return value.trim().toLowerCase();
}

export function toExtractionKind(
    value: unknown
  ): ExtractionKind
{
  const kind =
    asKindName(value);

  const known =
    EXTRACTION_KINDS.find(
      candidate => candidate === kind);

  if (!known) {
    throw new Error(
      `Unknown extraction kind: ${String(value)}. Use ${
        EXTRACTION_KINDS.join(', ')}.`);
  }

  return known;
}
