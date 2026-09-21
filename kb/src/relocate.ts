import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { Backlink,
         documentName,
         findBacklinks,
         isNameLink,
         resolveLinkTarget }
  from './backlinks.js';
import { ExtractedLink }
  from './extract.js';
import { listEntries,
         moveEntry,
         readTextFile,
         resolveTransferTarget }
  from './files.js';
import { LinkGraph }
  from './graph.js';
import { LibraryPathError,
         resolveLibraryPath,
         toLibraryPath }
  from './library.js';
import { parseMarkdown }
  from './markdown.js';
import { isMarkdown }
  from './notes.js';
import { LinkEdit,
         PathMapping,
         rewriteLinks,
         SkippedLink }
  from './link-rewrite.js';

export interface RelocateOptions
{
  overwrite?: boolean;

  /**
   * Rewrite the links that the move would otherwise break. Defaults to
   * `true`, since that is the reason to relocate rather than move.
   */
  updateLinks?: boolean;

  /**
   * Report the move and the edits without performing either.
   */
  dryRun?: boolean;

  /**
   * Index to consult for backlinks, and to keep current afterwards. When
   * absent, the library is scanned.
   */
  graph?: LinkGraph;
}

export interface RelocatedFile
{
  path: string;

  edits: LinkEdit[];

  /**
   * Links that need an edit but could not be located in the source, and were
   * therefore left alone.
   */
  skipped: SkippedLink[];
}

export interface RelocateResult
{
  source: string;

  target: string;

  /**
   * Every entry whose path changed, old path to new path. A folder move
   * reports one pair per file it carries.
   */
  moved: { from: string; to: string; }[];

  /**
   * Documents whose links were rewritten.
   */
  files: RelocatedFile[];

  dryRun: boolean;
}

/**
 * Move an entry and rewrite the links that the move would otherwise break.
 *
 * Both directions are handled: the links elsewhere that point at the entry,
 * and the relative links inside a moved document, which were relative to the
 * folder it left.
 *
 * A link whose destination cannot be resolved is left alone rather than
 * guessed at, and is reported as skipped.
 */
export async function relocateEntry(
    root: string,
    source: string,
    target: string,
    options: RelocateOptions = {}
  ): Promise<RelocateResult>
{
  const sourcePath =
    toLibraryPath(
      root,
      resolveLibraryPath(
        root,
        source));

  const targetPath =
    await resolveTransferTarget(
      root,
      source,
      target);

  if (sourcePath === '.') {
    throw new LibraryPathError(
      'The library root cannot be moved.');
  }

  const mapping =
    await buildMapping(
      root,
      sourcePath,
      targetPath);

  const updateLinks =
    options.updateLinks !== false;

  const referencing =
    await documentsPointingAt(
      root,
      mapping,
      updateLinks,
      options.graph);

  if (options.dryRun !== true) {
    await moveEntry(
      root,
      source,
      target,
      { overwrite: options.overwrite === true });
  }

  const moved =
    [ ...mapping.entries() ]
      .map(
        ([ from, to ]) => ({ from,
                             to }));

  if (!updateLinks) {
    return { source: sourcePath,
             target: targetPath,
             moved,
             files: [ ],
             dryRun: options.dryRun === true };
  }

  const existing =
    await listFilePaths(
      root,
      mapping,
      options.dryRun === true);

  const files: RelocatedFile[] = [ ];

  for (const entry of documentsToRewrite(
    mapping,
    referencing)) {
    const result =
      await rewriteDocument(
        root,
        entry,
        mapping,
        existing,
        options.dryRun === true);

    if (result) {
      files.push(result);
    }
  }

  await refreshGraph(
    options.graph,
    mapping,
    files,
    options.dryRun === true);

  return { source: sourcePath,
           target: targetPath,
           moved,
           files,
           dryRun: options.dryRun === true };
}

/**
 * The documents to rewrite, as `old path -> path after the move`. A moved
 * document is read at its new path; a document that merely refers to one is
 * read where it already is.
 */
function documentsToRewrite(
    mapping: PathMapping,
    referencing: Set<string>
  ): Map<string, string>
{
  const documents = new Map<string, string>();

  for (const [ from, to ] of mapping) {
    if (isMarkdown(to)) {
      documents.set(
        from,
        to);
    }
  }

  for (const documentPath of referencing) {
    if (
      !documents.has(documentPath)
      && isMarkdown(documentPath)
    ) {
      documents.set(
        documentPath,
        mapping.get(documentPath) ?? documentPath);
    }
  }

  return documents;
}

async function rewriteDocument(
    root: string,
    entry: [string, string],
    mapping: PathMapping,
    existing: Set<string>,
    dryRun: boolean
  ): Promise<RelocatedFile | null>
{
  const [ previousPath,
          currentPath ] = entry;

  const text =
    await readIfPresent(
      root,
      pathToRead(
        dryRun,
        previousPath,
        currentPath));

  if (text === null) {
    return null;
  }

  const result =
    rewriteLinks(
      parseMarkdown(
        text,
        currentPath),
      currentPath,
      mapping,
      link =>
      resolveBefore(
        root,
        previousPath,
        link,
        mapping,
        existing,
        previousPath !== currentPath));

  if (
    result.edits.length === 0
    && result.skipped.length === 0
  ) {
    return null;
  }

  if (
    !dryRun
    && result.edits.length > 0
  ) {
    await fs.writeFile(
      resolveLibraryPath(
        root,
        currentPath),
      result.text,
      'utf8');
  }

  return { path: currentPath,
           edits: result.edits,
           skipped: result.skipped };
}

/**
 * Text of a document, or `null` when it is not there. A document can vanish
 * between being listed and being read.
 */
async function readIfPresent(
    root: string,
    documentPath: string
  ): Promise<string | null>
{
  try {
    return await readTextFile(
      root,
      documentPath);
  } catch {
    return null;
  }
}

/**
 * The library path a link addressed before the move, or `null` when the link
 * needs no rewrite.
 *
 * A link is rewritten when its destination moved, and, for a document that
 * moved itself, when its destination stayed put and the relative path to it
 * therefore changed.
 */
function resolveBefore(
    root: string,
    documentPath: string,
    link: ExtractedLink,
    mapping: PathMapping,
    existing: Set<string>,
    documentMoved: boolean
  ): string | null
{
  const candidates =
    resolveLinkTarget(
      root,
      documentPath,
      link);

  if (candidates.length === 0) {
    return null;
  }

  if (isNameLink(link)) {
    const name = candidates[0];

    for (const from of mapping.keys()) {
      if (
        documentName(from)
        === name
      ) {
        return from;
      }
    }

    return null;
  }

  const mapped =
    candidates.find(
      candidate => mapping.has(candidate));

  if (mapped !== undefined) {
    return mapped;
  }

  if (!documentMoved) {
    return null;
  }

  return candidates.find(
    candidate => existing.has(candidate))
    ?? null;
}

/**
 * Every file the move renames, old path to new path.
 */
async function buildMapping(
    root: string,
    sourcePath: string,
    targetPath: string
  ): Promise<Map<string, string>>
{
  const mapping = new Map<string, string>();

  // Filtered by prefix rather than matched by glob, so that a folder whose
  // name holds a glob character is still handled.
  const contained =
    (await listEntries(
      root,
      { kind: 'file',
        hidden: true }))
      .filter(
        entry =>
        entry.path.startsWith(`${sourcePath}/`));

  if (contained.length === 0) {
    mapping.set(
      sourcePath,
      targetPath);

    return mapping;
  }

  for (const entry of contained) {
    mapping.set(
      entry.path,
      `${targetPath}/${entry.path.slice(sourcePath.length + 1)}`);
  }

  return mapping;
}

/**
 * A dry run has not moved anything, so a document is still read where it was.
 */
function pathToRead(
    dryRun: boolean,
    previousPath: string,
    currentPath: string
  ): string
{
  if (dryRun) {
    return previousPath;
  }

  return currentPath;
}

/**
 * Nothing refers to the move when links are not being rewritten.
 */
async function documentsPointingAt(
    root: string,
    mapping: PathMapping,
    updateLinks: boolean,
    graph: LinkGraph | undefined
  ): Promise<Set<string>>
{
  if (!updateLinks) {
    return new Set<string>();
  }

  return await findReferencingDocuments(
    root,
    mapping,
    graph);
}

async function findReferencingDocuments(
    root: string,
    mapping: PathMapping,
    graph?: LinkGraph
  ): Promise<Set<string>>
{
  const documents = new Set<string>();

  for (const from of mapping.keys()) {
    const backlinks =
      await backlinksTo(
        root,
        from,
        graph);

    for (const backlink of backlinks) {
      documents.add(backlink.path);
    }
  }

  return documents;
}

/**
 * Backlinks from the index when there is one, and from a scan otherwise.
 */
async function backlinksTo(
    root: string,
    documentPath: string,
    graph: LinkGraph | undefined
  ): Promise<Backlink[]>
{
  if (graph) {
    return graph.backlinksTo(
      documentPath,
      { includeSelf: true });
  }

  return await findBacklinks(
    root,
    documentPath,
    { includeSelf: true });
}

/**
 * Library paths that exist after the move, used to tell a link to a document
 * that stayed put from a link that leads nowhere.
 */
async function listFilePaths(
    root: string,
    mapping: PathMapping,
    dryRun: boolean
  ): Promise<Set<string>>
{
  const entries =
    await listEntries(
      root,
      { kind: 'file',
        hidden: true });

  const paths =
    new Set(
      entries.map(entry => entry.path));

  if (dryRun) {
    for (const [ from, to ] of mapping) {
      paths.delete(from);
      paths.add(to);
    }
  }

  return paths;
}

async function refreshGraph(
    graph: LinkGraph | undefined,
    mapping: PathMapping,
    files: RelocatedFile[],
    dryRun: boolean
  ): Promise<void>
{
  if (
    !graph
    || dryRun
  ) {
    return;
  }

  for (const [ from, to ] of mapping) {
    graph.remove(from);

    await graph.update(to);
  }

  for (const file of files) {
    await graph.update(file.path);
  }
}

/**
 * A path beside an entry, in the folder it already sits in.
 */
function siblingPath(
    folder: string,
    name: string
  ): string
{
  if (folder === '.') {
    return name;
  }

  return `${folder}/${name}`;
}

/**
 * Rename an entry inside the folder it already sits in.
 */
export async function renameEntry(
    root: string,
    source: string,
    name: string,
    options: RelocateOptions = {}
  ): Promise<RelocateResult>
{
  if (
    name.includes('/')
    || name.includes('\\')
  ) {
    throw new LibraryPathError(
      'A new name cannot contain a path separator. Use move instead.');
  }

  const sourcePath =
    toLibraryPath(
      root,
      resolveLibraryPath(
        root,
        source));

  const folder =
    path.posix.dirname(sourcePath);

  return await relocateEntry(
    root,
    sourcePath,
    siblingPath(
      folder,
      name),
    options);
}
