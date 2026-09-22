import { Stats }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { glob }
  from 'glob';
import { toPosixPath }
  from './formatting.js';
import { isInsideLibrary,
         LibraryPathError,
         resolveLibraryPath,
         toLibraryPath }
  from './library.js';

export type EntryKind =
  | 'file'
  | 'folder';

export interface LibraryEntry
{
  /**
   * Library-relative POSIX path.
   */
  path: string;

  kind: EntryKind;

  /**
   * Size in bytes. Always `0` for folders.
   */
  size: number;

  /**
   * Last modification time, in ISO 8601 form.
   */
  modified: string;
}

export interface ListOptions
{
  /**
   * Glob pattern, relative to the library root. Defaults to `**\/*`.
   */
  pattern?: string;

  /**
   * Restrict the result to files or to folders. Defaults to `any`.
   */
  kind?: EntryKind | 'any';

  /**
   * Include dot files and dot folders. Defaults to `false`.
   */
  hidden?: boolean;

}

export interface OverwriteOptions
{
  overwrite?: boolean;
}

export interface WriteOptions
  extends OverwriteOptions
{
  /**
   * Create missing parent folders. Defaults to `true`.
   */
  createFolders?: boolean;
}

export interface RemoveOptions
{
  /**
   * Allow removing a non-empty folder. Defaults to `false`.
   */
  recursive?: boolean;
}

export interface TransferResult
{
  source: string;
  target: string;
}

export const DEFAULT_EXCLUDES =
  [ '**/node_modules/**',
    '**/.git/**' ];

const DEFAULT_PATTERN = '**/*';

/**
 * Take a glob pattern, or the fallback when none was given.
 */
export function globPattern(
    value: string | undefined,
    fallback: string
  ): string
{
  if (value === undefined) {
    return fallback;
  }

  const pattern =
    value.trim();

  if (pattern === '') {
    return fallback;
  }

  return toPosixPath(pattern);
}

/**
 * List library entries matching a glob pattern, sorted by path.
 */
export async function listEntries(
    root: string,
    options: ListOptions = {}
  ): Promise<LibraryEntry[]>
{
  const pattern =
    globPattern(
      options.pattern,
      DEFAULT_PATTERN);

  const matches =
    await glob(
      pattern,
      { cwd: root,
        dot: options.hidden === true,
        ignore: DEFAULT_EXCLUDES,
        nodir: false,
        absolute: true });

  const kind =
    options.kind ?? 'any';

  const entries: LibraryEntry[] = [ ];

  for (const match of matches) {
    if (
      !isInsideLibrary(
        root,
        match)
    ) {
      continue;
    }

    const entry =
      await describe(
        root,
        match);

    if (!entry) {
      continue;
    }

    if (
      kind !== 'any'
      && entry.kind !== kind
    ) {
      continue;
    }

    entries.push(entry);
  }

  return entries.sort(
    (left, right) =>
    left.path.localeCompare(right.path));
}

/**
 * Describe a single library entry.
 */
export async function statEntry(
    root: string,
    value: string
  ): Promise<LibraryEntry>
{
  const absolute =
    resolveLibraryPath(
      root,
      value);

  const entry =
    await describe(
      root,
      absolute);

  if (!entry) {
    throw new Error(
      `Entry does not exist: ${toLibraryPath(
        root,
        absolute)}`);
  }

  return entry;
}

/**
 * Read a UTF-8 text file from the library.
 */
export async function readTextFile(
    root: string,
    value: string
  ): Promise<string>
{
  const absolute =
    resolveLibraryPath(
      root,
      value);

  return await fs.readFile(
    absolute,
    'utf8');
}

/**
 * Write a UTF-8 text file into the library.
 *
 * Parent folders are created by default. An existing file is only replaced
 * when `overwrite` is set.
 */
export async function writeTextFile(
    root: string,
    value: string,
    content: string,
    options: WriteOptions = {}
  ): Promise<LibraryEntry>
{
  const absolute =
    resolveLibraryPath(
      root,
      value);

  if (
    options.overwrite !== true
    && await exists(absolute)
  ) {
    throw new Error(
      `File already exists: ${toLibraryPath(
        root,
        absolute)}`);
  }

  if (
    options.createFolders
    !== false
  ) {
    await fs.mkdir(
      path.dirname(absolute),
      { recursive: true });
  }

  await fs.writeFile(
    absolute,
    content,
    'utf8');

  return await statEntry(
    root,
    absolute);
}

/**
 * Create a folder, including any missing parent folders.
 */
export async function createFolder(
    root: string,
    value: string
  ): Promise<LibraryEntry>
{
  const absolute =
    resolveLibraryPath(
      root,
      value);

  await fs.mkdir(
    absolute,
    { recursive: true });

  return await statEntry(
    root,
    absolute);
}

/**
 * Move or rename a file or a folder.
 *
 * When the target is an existing folder, the source is moved into it, keeping
 * its own name.
 */
export async function moveEntry(
    root: string,
    source: string,
    target: string,
    options: OverwriteOptions = {}
  ): Promise<TransferResult>
{
  const { absoluteSource,
          absoluteTarget } =
    await planTransfer(
      root,
      source,
      target,
      options);

  await fs.mkdir(
    path.dirname(absoluteTarget),
    { recursive: true });

  await fs.rename(
    absoluteSource,
    absoluteTarget);

  return { source:
             toLibraryPath(
               root,
               absoluteSource),
           target:
             toLibraryPath(
               root,
               absoluteTarget) };
}

/**
 * Copy a file or a folder.
 *
 * When the target is an existing folder, the source is copied into it, keeping
 * its own name.
 */
export async function copyEntry(
    root: string,
    source: string,
    target: string,
    options: OverwriteOptions = {}
  ): Promise<TransferResult>
{
  const { absoluteSource,
          absoluteTarget } =
    await planTransfer(
      root,
      source,
      target,
      options);

  await fs.mkdir(
    path.dirname(absoluteTarget),
    { recursive: true });

  await fs.cp(
    absoluteSource,
    absoluteTarget,
    { recursive: true,
      force: options.overwrite === true,
      errorOnExist: options.overwrite !== true });

  return { source:
             toLibraryPath(
               root,
               absoluteSource),
           target:
             toLibraryPath(
               root,
               absoluteTarget) };
}

/**
 * Remove a file or a folder. Non-empty folders require `recursive`.
 */
export async function removeEntry(
    root: string,
    value: string,
    options: RemoveOptions = {}
  ): Promise<string>
{
  const absolute =
    resolveLibraryPath(
      root,
      value);

  if (
    toLibraryPath(
      root,
      absolute) === '.'
  ) {
    throw new LibraryPathError(
      'The library root cannot be removed.');
  }

  const stats =
    await fs.lstat(absolute);

  if (
    stats.isDirectory()
    && options.recursive !== true
  ) {
    const children =
      await fs.readdir(absolute);

    if (children.length > 0) {
      throw new Error(
        `Folder is not empty: ${toLibraryPath(
          root,
          absolute)}`);
    }
  }

  await fs.rm(
    absolute,
    { recursive: options.recursive === true,
      force: false });

  return toLibraryPath(
    root,
    absolute);
}

/**
 * Resolve the final path of a move or a copy, without performing it.
 *
 * When the target is an existing folder, the entry lands inside it under its
 * own name, so the caller cannot work the destination out by path math alone.
 */
export async function resolveTransferTarget(
    root: string,
    source: string,
    target: string
  ): Promise<string>
{
  const absoluteSource =
    resolveLibraryPath(
      root,
      source);

  const requestedTarget =
    resolveLibraryPath(
      root,
      target);

  if (await isFolder(requestedTarget)) {
    return toLibraryPath(
      root,
      path.join(
        requestedTarget,
        path.basename(absoluteSource)));
  }

  return toLibraryPath(
    root,
    requestedTarget);
}

async function planTransfer(
    root: string,
    source: string,
    target: string,
    options: OverwriteOptions
  ): Promise<{ absoluteSource: string; absoluteTarget: string; }>
{
  const absoluteSource =
    resolveLibraryPath(
      root,
      source);

  if (!await exists(absoluteSource)) {
    throw new Error(
      `Entry does not exist: ${toLibraryPath(
        root,
        absoluteSource)}`);
  }

  const absoluteTarget =
    resolveLibraryPath(
      root,
      await resolveTransferTarget(
        root,
        source,
        target));

  if (absoluteTarget === absoluteSource) {
    throw new Error(
      'Source and target are the same entry.');
  }

  if (
    await isFolder(absoluteSource)
    && isInsideLibrary(
      absoluteSource,
      absoluteTarget)
  ) {
    throw new LibraryPathError(
      'A folder cannot be moved or copied into itself.');
  }

  if (
    options.overwrite !== true
    && await exists(absoluteTarget)
  ) {
    throw new Error(
      `Target already exists: ${toLibraryPath(
        root,
        absoluteTarget)}`);
  }

  if (
    options.overwrite === true
    && await exists(absoluteTarget)
  ) {
    await fs.rm(
      absoluteTarget,
      { recursive: true,
        force: true });
  }

  return { absoluteSource,
           absoluteTarget };
}

async function describe(
    root: string,
    absolute: string
  ): Promise<LibraryEntry | null>
{
  const stats =
    await statOrNull(absolute);

  if (!stats) {
    return null;
  }

  if (
    !stats.isFile()
    && !stats.isDirectory()
  ) {
    return null;
  }

  const entryPath =
    toLibraryPath(
      root,
      absolute);

  const modified =
    stats.mtime.toISOString();

  if (stats.isDirectory()) {
    return { path: entryPath,
             kind: 'folder',
             size: 0,
             modified };
  }

  return { path: entryPath,
           kind: 'file',
           size: stats.size,
           modified };
}

async function exists(
    absolute: string
  ): Promise<boolean>
{
  const stats =
    await statOrNull(absolute);

  return stats !== null;
}

async function isFolder(
    absolute: string
  ): Promise<boolean>
{
  const stats =
    await statOrNull(absolute);

  if (!stats) {
    return false;
  }

  return stats.isDirectory();
}

/**
 * Stats of an entry, or `null` when it is not there.
 */
async function statOrNull(
    absolute: string
  ): Promise<Stats | null>
{
  try {
    return await fs.lstat(absolute);
  } catch {
    return null;
  }
}
