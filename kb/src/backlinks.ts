import path
  from 'node:path';
import { ExtractedLink,
         extractLinks,
         LinkKind }
  from './extract.js';
import { listEntries,
         readTextFile }
  from './files.js';
import { isInsideLibrary,
         resolveLibraryPath,
         toLibraryPath }
  from './library.js';
import { parseMarkdown }
  from './markdown.js';
import { isMarkdown }
  from './notes.js';

export interface Backlink
{
  /**
   * Library-relative POSIX path of the document holding the link.
   */
  path: string;

  line: number;

  column: number;

  kind: LinkKind;

  /**
   * Link destination as written, so that it can be found and edited.
   */
  target: string;

  /**
   * Link text, or the definition identifier for a `definition` link.
   */
  text: string;
}

export interface BacklinkOptions
{
  /**
   * Glob pattern limiting the documents to scan. Defaults to `**\/*.md`.
   */
  pattern?: string;

  /**
   * Include dot files and dot folders. Defaults to `false`.
   */
  hidden?: boolean;

  /**
   * Include links a document makes to itself. Defaults to `false`.
   */
  includeSelf?: boolean;
}

const DEFAULT_PATTERN = '**/*.md';

const EXTERNAL_TARGET =
  /^[a-z][a-z0-9+.-]*:/i;

const MARKDOWN_EXTENSIONS =
  [ '.md',
    '.markdown' ];

/**
 * Find every markdown link that points at one library entry.
 *
 * The target does not have to exist, so backlinks can be inspected before a
 * file is created and after it is removed or moved.
 *
 * Only markdown documents are scanned, because only they carry links.
 */
export async function findBacklinks(
    root: string,
    target: string,
    options: BacklinkOptions = {}
  ): Promise<Backlink[]>
{
  const absoluteTarget =
    resolveLibraryPath(
      root,
      target);

  const targetPath =
    toLibraryPath(
      root,
      absoluteTarget);

  const entries =
    await listEntries(
      root,
      { pattern:
          options.pattern
          && options.pattern.trim() !== ''
            ? options.pattern
            : DEFAULT_PATTERN,
        kind: 'file',
        hidden: options.hidden });

  const backlinks: Backlink[] = [ ];

  for (const entry of entries) {
    if (!isMarkdown(entry.path)) {
      continue;
    }

    if (
      entry.path === targetPath
      && options.includeSelf !== true
    ) {
      continue;
    }

    const document =
      parseMarkdown(
        await readTextFile(
          root,
          entry.path),
        entry.path);

    for (const link of extractLinks(document)) {
      if (
        !referencesTarget(
          root,
          entry.path,
          link,
          targetPath)
      ) {
        continue;
      }

      backlinks.push(
        { path: entry.path,
          line: link.line,
          column: link.column,
          kind: link.kind,
          target: link.target,
          text: link.text });
    }
  }

  return backlinks;
}

/**
 * Resolve the destination of a link into candidate library paths.
 *
 * A wiki link written as a bare name resolves to that name rather than to a
 * path, because it matches any document with that name, wherever it sits.
 *
 * Returns an empty list when the link does not address a library file: a
 * reference to a definition, an external URL, a bare fragment, or a path that
 * leaves the library.
 *
 * Resolution rules:
 *
 * - a wiki link without a slash matches any document with that name;
 * - a wiki link with a slash is resolved from the library root;
 * - a target starting with `/` is resolved from the library root;
 * - any other target is resolved from the folder of the linking document;
 * - a fragment or a query string is dropped before resolving;
 * - a target without an extension also matches the markdown file of that
 *   name, which is how a link written without `.md` is followed.
 */
export function resolveLinkTarget(
    root: string,
    documentPath: string,
    link: ExtractedLink
  ): string[]
{
  if (link.kind === 'reference') {
    return [ ];
  }

  const target =
    stripLocation(link.target);

  if (target === '') {
    return [ ];
  }

  if (link.kind === 'wiki') {
    if (!target.includes('/')) {
      return [ documentName(target) ];
    }

    return candidatesFrom(
      root,
      root,
      target);
  }

  if (EXTERNAL_TARGET.test(target)) {
    return [ ];
  }

  if (target.startsWith('/')) {
    return candidatesFrom(
      root,
      root,
      target.slice(1));
  }

  return candidatesFrom(
    root,
    path.dirname(
      resolveLibraryPath(
        root,
        documentPath)),
    target);
}

function referencesTarget(
    root: string,
    documentPath: string,
    link: ExtractedLink,
    targetPath: string
  ): boolean
{
  const candidates =
    resolveLinkTarget(
      root,
      documentPath,
      link);

  if (candidates.length === 0) {
    return false;
  }

  if (
    link.kind === 'wiki'
    && !link.target.includes('/')
  ) {
    return candidates.includes(
      documentName(targetPath));
  }

  return candidates.includes(targetPath);
}

function candidatesFrom(
    root: string,
    from: string,
    target: string
  ): string[]
{
  const resolved =
    path.resolve(
      from,
      target);

  if (
    !isInsideLibrary(
      root,
      resolved)
  ) {
    return [ ];
  }

  return withMarkdownCandidates(
    toLibraryPath(
      root,
      resolved));
}

/**
 * Name of a document, without its folder and without its extension.
 */
function documentName(
    value: string
  ): string
{
  return path.basename(
    value,
    path.extname(value));
}

function withMarkdownCandidates(
    value: string
  ): string[]
{
  if (path.extname(value) !== '') {
    return [ value ];
  }

  return [ value,
           ...MARKDOWN_EXTENSIONS.map(
             extension => `${value}${extension}`) ];
}

/**
 * Drop the fragment and the query string of a link target.
 */
function stripLocation(
    value: string
  ): string
{
  const trimmed =
    value.trim();

  const withoutFragment =
    trimmed.split('#')[0] ?? '';

  return (withoutFragment.split('?')[0] ?? '').trim();
}
