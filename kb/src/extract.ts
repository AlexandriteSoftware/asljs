import { Code,
         Heading,
         Link,
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
  | 'wiki';

export interface ExtractedLink
{
  kind: LinkKind;
  target: string;
  text: string;
  line: number;
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
      if (node.type === 'link') {
        const link =
          node as Link;

        links.push(
          { kind: 'inline',
            target: link.url,
            text:
              toPlainText(link),
            line:
              lineOf(
                document,
                link) });

        return;
      }

      if (node.type === 'image') {
        const image =
          node as Link & { alt?: string | null; };

        links.push(
          { kind: 'image',
            target: image.url,
            text: image.alt ?? '',
            line:
              lineOf(
                document,
                image) });

        return;
      }

      if (node.type === 'linkReference') {
        const reference =
          node as Parent & { identifier: string; };

        links.push(
          { kind: 'reference',
            target:
              reference.identifier,
            text:
              toPlainText(reference),
            line:
              lineOf(
                document,
                reference) });

        return;
      }

      if (node.type === 'text') {
        const text =
          node as Text;

        for (const match of text.value.matchAll(WIKI_LINK_PATTERN)) {
          links.push(
            { kind: 'wiki',
              target:
                (match[1] ?? '').trim(),
              text:
                (match[2] ?? match[1] ?? '').trim(),
              line:
                lineOf(
                  document,
                  text) });
        }
      }
    });

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
export function toExtractionKind(
    value: unknown
  ): ExtractionKind
{
  const kind =
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : '';

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
