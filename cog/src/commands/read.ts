import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Envelope,
         type EnvelopeFile,
         type Command }
  from '../model/envelope.js';
import { type RollbackFeed }
  from '../model/rollback.js';

const textDecoder =
  new TextDecoder(
    'utf-8',
    { fatal: true });

const defaultLines = 150;
const defaultSizeKb = 15;

export interface Read
  extends Command
{
  pattern: string;
  exclude?: string[];
  lines?: number;
  sizeKb?: number;
  readToEnd?: boolean;
  withBinaryB64?: boolean;
}

interface ReadTarget
{
  path: string;
  diskPath: string;
}

interface ReadOptions
{
  lines: number;
  sizeKb: number;
  readToEnd: boolean;
  withBinaryB64: boolean;
}

export async function read(
    envelope: Envelope,
    command: Read,
    _rollbackFeed?: RollbackFeed
  ): Promise<void>
{
  if (!command.pattern) {
    throw new Error(
      'Read command pattern is required');
  }

  const normalizedCommand =
    normalizeCommand(
      command);

  const targets =
    await getReadTargets(
      normalizedCommand.pattern,
      normalizedCommand.exclude ?? []);

  for (const target of targets) {
    const file =
      await getEnvelopeFile(
        target,
        getUpdateCommand(
          target,
          normalizedCommand),
        { lines:
            normalizedCommand.lines ?? defaultLines,
          sizeKb:
            normalizedCommand.sizeKb ?? defaultSizeKb,
          readToEnd:
            normalizedCommand.readToEnd ?? false,
          withBinaryB64:
            normalizedCommand.withBinaryB64 ?? false });

    const fileIndex =
      envelope.files
        .findIndex(
          file =>
            file.path === target.path);

    if (fileIndex === -1) {
      envelope.files
        .push(
          file);
    } else {
      envelope.files[fileIndex] =
        file;
    }
  }
}

export async function rollbackRead(
    _rollbackFeed: RollbackFeed
  ): Promise<void>
{
}

function normalizeCommand(
    command: Read
  ): Read
{
  return {
    command: 'read',
    pattern:
      command.pattern,
    exclude:
      command.exclude ?? [],
    lines:
      command.lines ?? defaultLines,
    sizeKb:
      command.sizeKb ?? defaultSizeKb,
    readToEnd:
      command.readToEnd ?? false,
    withBinaryB64:
      command.withBinaryB64 ?? false
  };
}

function getUpdateCommand(
    target: ReadTarget,
    command: Read
  ): Read
{
  return {
    ...command,
    pattern:
      target.path
  };
}

async function getReadTargets(
    pattern: string,
    excludes: string[]
  ): Promise<ReadTarget[]>
{
  const stat =
    await statIfExists(
      pattern);

  if (stat?.isFile()) {
    return isExcluded(
        path.resolve(
          pattern),
        excludes)
      ? []
      : [
          { path:
              pattern,
            diskPath:
              pattern }
        ];
  }

  if (stat?.isDirectory()) {
    return getDirectoryTargets(
      pattern,
      excludes);
  }

  if (!hasGlobMagic(
      pattern)) {
    await fs.stat(
      pattern);
  }

  return getGlobTargets(
    pattern,
    excludes);
}

async function getDirectoryTargets(
    dirPath: string,
    excludes: string[]
  ): Promise<ReadTarget[]>
{
  const diskPaths =
    await walkFiles(
      dirPath);

  return diskPaths
    .filter(
      diskPath =>
        !isExcluded(
          path.resolve(
            diskPath),
          excludes))
    .map(
      diskPath => ({
        path:
          toDisplayPath(
            diskPath),
        diskPath
      }));
}

async function getGlobTargets(
    pattern: string,
    excludes: string[]
  ): Promise<ReadTarget[]>
{
  const root =
    globRoot(
      pattern);

  const diskPaths =
    await walkFiles(
      root);

  const matcher =
    globMatcher(
      pattern);

  return diskPaths
    .filter(
      diskPath =>
        matcher(
          toComparablePath(
            diskPath,
            path.isAbsolute(
              pattern)))
        && !isExcluded(
          path.resolve(
            diskPath),
          excludes))
    .map(
      diskPath => ({
        path:
          toDisplayPath(
            diskPath),
        diskPath
      }));
}

async function walkFiles(
    root: string
  ): Promise<string[]>
{
  const entries =
    await fs.readdir(
      root,
      { withFileTypes: true });

  const files: string[] =
    [];

  for (const entry of entries) {
    const entryPath =
      path.join(
        root,
        entry.name);

    if (entry.isDirectory()) {
      files.push(
        ...await walkFiles(
          entryPath));
    } else if (entry.isFile()) {
      files.push(
        entryPath);
    }
  }

  return files
    .sort();
}

async function statIfExists(
    filePath: string
  ): Promise<Awaited<ReturnType<typeof fs.stat>> | undefined>
{
  try {
    return await fs.stat(
      filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

function isExcluded(
    diskPath: string,
    excludes: string[]
  ): boolean
{
  return excludes
    .some(
      exclude => {
        if (hasGlobMagic(
            exclude)) {
          return globMatcher(
            exclude)(
            toComparablePath(
              diskPath,
              path.isAbsolute(
                exclude)));
        }

        const resolvedExclude =
          path.resolve(
            exclude);

        return diskPath === resolvedExclude
          || diskPath.startsWith(
            `${resolvedExclude}${path.sep}`);
      });
}

async function getEnvelopeFile(
    target: ReadTarget,
    update: Read,
    options: ReadOptions
  ): Promise<EnvelopeFile>
{
  const data =
    await fs.readFile(
      target.diskPath);

  let content: string;

  try {
    content =
      textDecoder.decode(
        data);
  } catch {
    if (options.withBinaryB64) {
      return {
        path:
          target.path,
        type:
          'binary',
        content:
          data.toString(
            'base64'),
        complete:
          true,
        update
      };
    }

    return {
      path:
        target.path,
      type:
        'binary',
      update
    };
  }

  const limited =
    limitText(
      content,
      options);

  return {
    path:
      target.path,
    type:
      'text',
    content:
      limited.content,
    complete:
      limited.complete,
    update
  };
}

function limitText(
    content: string,
    options: ReadOptions
  ): { content: string; complete: boolean }
{
  if (options.readToEnd) {
    return {
      content,
      complete:
        true
    };
  }

  let limitedContent =
    content;

  let complete =
    true;

  const maxBytes =
    options.sizeKb * 1024;

  if (Buffer.byteLength(
      limitedContent,
      'utf8') > maxBytes) {
    limitedContent =
      Buffer.from(
        limitedContent,
        'utf8')
        .subarray(
          0,
          maxBytes)
        .toString(
          'utf8');

    complete =
      false;
  }

  const lines =
    limitedContent.split(
      /\r?\n/);

  if (lines.length > options.lines) {
    limitedContent =
      lines
        .slice(
          0,
          options.lines)
        .join(
          '\n');

    complete =
      false;
  }

  return {
    content:
      limitedContent,
    complete
  };
}

function hasGlobMagic(
    pattern: string
  ): boolean
{
  return /[*?[\]{}]/.test(
    pattern);
}

function globRoot(
    pattern: string
  ): string
{
  const normalized =
    normalizeSlashes(
      pattern);

  const parts =
    normalized.split(
      '/');

  const rootParts: string[] =
    [];

  for (const part of parts) {
    if (hasGlobMagic(
        part)) {
      break;
    }

    rootParts.push(
      part);
  }

  if (rootParts.length === 0) {
    return '.';
  }

  if (path.isAbsolute(
      pattern)
      && rootParts.length === 1
      && rootParts[0] === '') {
    return path.sep;
  }

  return rootParts.join(
    path.sep) || '.';
}

function globMatcher(
    pattern: string
  ): (candidate: string) => boolean
{
  const regex =
    new RegExp(
      `^${globToRegexSource(
        stripDotSlash(
          normalizeSlashes(
            pattern)))}$`);

  return candidate =>
    regex.test(
      stripDotSlash(
        normalizeSlashes(
          candidate)));
}

function globToRegexSource(
    pattern: string
  ): string
{
  let source =
    '';

  for (let index = 0; index < pattern.length; index += 1) {
    const char =
      pattern[index];

    if (char === '*') {
      if (pattern[index + 1] === '*') {
        source +=
          '.*';
        index +=
          1;
      } else {
        source +=
          '[^/]*';
      }
    } else if (char === '?') {
      source +=
        '[^/]';
    } else {
      source +=
        escapeRegex(
          char);
    }
  }

  return source;
}

function escapeRegex(
    value: string
  ): string
{
  return value.replace(
    /[|\\{}()[\]^$+?.]/g,
    '\\$&');
}

function toComparablePath(
    diskPath: string,
    absolute: boolean
  ): string
{
  return absolute
    ? path.resolve(
      diskPath)
    : path.relative(
      process.cwd(),
      diskPath);
}

function toDisplayPath(
    diskPath: string
  ): string
{
  return stripDotSlash(
    normalizeSlashes(
      path.relative(
        process.cwd(),
        diskPath)));
}

function normalizeSlashes(
    value: string
  ): string
{
  return value.replace(
    /\\/g,
    '/');
}

function stripDotSlash(
    value: string
  ): string
{
  return value.replace(
    /^\.\//,
    '');
}
