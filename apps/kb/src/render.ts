import { escapeHtml,
         markdownToHtml }
  from 'asljs-mdcli';
import { type Text }
  from 'mdast';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { documentName }
  from './backlinks.js';
import { listEntries,
         statEntry }
  from './files.js';
import { resolveLibraryPath }
  from './library.js';
import { parseMarkdown }
  from './markdown.js';

const WIKI_LINK_PATTERN =
  /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export interface RenderedDocument
{
  /**
   * Library-relative POSIX path of the document.
   */
  path: string;

  /**
   * The `title` of the front matter, else the first level 1 heading, else the
   * file name without its extension.
   */
  title: string;

  /**
   * The body as HTML, without the front matter.
   */
  html: string;
}

/**
 * Render a markdown document of the library as HTML.
 *
 * The front matter is left out, and each `[[wiki link]]` outside code becomes
 * a link relative to the document: a bare name to the first markdown document
 * of the library, by path, with that name; a name with a slash to that path
 * from the library root. A wiki link that matches no document is kept as its
 * text, marked with the `missing-link` class.
 */
export async function renderDocument(
    root: string,
    documentPath: string
  ): Promise<RenderedDocument>
{
  const entry =
    await statEntry(
      root,
      documentPath);

  if (
    entry.kind !== 'file'
    || path.extname(entry.path).toLowerCase()
       !== '.md'
  ) {
    throw new Error(
      `Not a markdown document: ${entry.path}`);
  }

  const text =
    await fs.readFile(
      resolveLibraryPath(
        root,
        entry.path),
      'utf8');

  const document =
    parseMarkdown(
      text,
      entry.path);

  const body =
    await linkWikiLinks(
      root,
      entry.path,
      document.body,
      collectText(document.root));

  return { path: entry.path,
           title:
             titleOf(
               entry.path,
               document.frontMatter.data,
               document.root),
           html:
             markdownToHtml(body) };
}

async function linkWikiLinks(
    root: string,
    documentPath: string,
    body: string,
    texts: Text[]
  ): Promise<string>
{
  const links: {
    start: number;
    end: number;
    target: string;
    label: string;
  }[] = [ ];

  for (const node of texts) {
    const start =
      node.position?.start.offset;

    const end =
      node.position?.end.offset;

    if (
      start === undefined
      || end === undefined
    ) {
      continue;
    }

    // A text node's value can differ from its source, e.g. for an escape, so
    // the source is searched rather than the value.
    for (
      const match of body
        .slice(
          start,
          end)
        .matchAll(WIKI_LINK_PATTERN)
    ) {
      const target =
        (match[1] ?? '').trim();

      links.push(
        { start: start + match.index,
          end:
            start + match.index + match[0].length,
          target,
          label:
            (match[2] ?? target).trim() });
    }
  }

  if (links.length === 0) {
    return body;
  }

  const documents =
    (await listEntries(
      root,
      { pattern: '**/*.md',
        kind: 'file' }))
    .map(
      found => found.path)
    .sort();

  let result = body;

  for (const link of links.reverse()) {
    const target =
      resolveWikiTarget(
        documents,
        link.target);

    const replacement =
      target === null
      ? `<span class="missing-link">${escapeHtml(link.label)}</span>`
      : `[${link.label}](<${
        relativeHref(
          documentPath,
          target)
      }>)`;

    result =
      result.slice(
        0,
        link.start)
      + replacement
      + result.slice(link.end);
  }

  return result;
}

function resolveWikiTarget(
    documents: string[],
    target: string
  ): string | null
{
  const [withoutFragment] =
    target.split('#');

  const name =
    withoutFragment.trim();

  if (name.includes('/')) {
    const wanted =
      name.replace(
        /^\//,
        '');

    return documents.find(
      candidate =>
        candidate === wanted
        || candidate === `${wanted}.md`)
      ?? null;
  }

  return documents.find(
    candidate => documentName(candidate) === documentName(name))
    ?? null;
}

function relativeHref(
    from: string,
    to: string
  ): string
{
  const relative =
    path.posix.relative(
      path.posix.dirname(from),
      to);

  return relative
    .split('/')
    .map(
      segment => encodeURIComponent(segment))
    .join('/');
}

function titleOf(
    documentPath: string,
    data: Record<string, unknown> | null,
    root: ReturnType<typeof parseMarkdown>['root']
  ): string
{
  const title = data?.title;

  if (
    typeof title
    === 'string'
    && title.trim() !== ''
  ) {
    return title.trim();
  }

  const heading =
    root.children.find(
      node =>
      node.type === 'heading'
      && node.depth === 1);

  if (heading !== undefined) {
    const text =
      collectText(heading)
      .map(
        node => node.value)
      .join('')
      .trim();

    if (text !== '') {
      return text;
    }
  }

  return documentName(documentPath);
}

/**
 * The text nodes of a tree, outside code, in document order.
 */
function collectText(
    node: unknown
  ): Text[]
{
  const found: Text[] = [ ];

  const visit =
    (
        current: unknown
      ): void =>
    {
    const typed =
      current as { type?: string; children?: unknown[]; };

    if (typed.type === 'text') {
      found.push(
        current as Text);

      return;
    }

    for (const child of typed.children ?? [ ]) {
      visit(child);
    }
  };

  visit(node);

  return found;
}
