import fsp
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Envelope,
         type EnvelopeFile }
  from '../model/envelope.js';
import { type Command as CommandParameters }
  from '../model/command.js';
import { type RollbackFeed }
  from '../model/rollback.js';
import { LocationResolver }
  from '../location.js';
import { createLogger }
  from '../logger.js';

const textDecoder =
  new TextDecoder(
    'utf-8',
    { fatal: true });

const defaultLines = 150;
const defaultSizeKb = 15;

export interface ReadParameters
  extends CommandParameters
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

interface ReadLimits
{
  lines: number;
  sizeKb: number;
  readToEnd: boolean;
  withBinaryB64: boolean;
}

export async function read(
    envelope: Envelope,
    parameters: ReadParameters
  ): Promise<void>
{
  if (!parameters.pattern) {
    throw new Error(
      'Read command pattern is required');
  }

  const normalizedParameters =
    normalizeReadParameters(
      parameters);

  const targets =
    await getReadTargets(
      normalizedParameters.pattern,
      normalizedParameters.exclude
      ?? []);

  for (const target of targets) {
    const file =
      await getEnvelopeFile(
        target,
        getUpdateCommand(
          target,
          normalizedParameters),
        { lines:
            normalizedParameters.lines ?? defaultLines,
          sizeKb:
            normalizedParameters.sizeKb ?? defaultSizeKb,
          readToEnd:
            normalizedParameters.readToEnd ?? false,
          withBinaryB64:
            normalizedParameters.withBinaryB64 ?? false });

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

function normalizeReadParameters(
    command: ReadParameters
  ): ReadParameters
{
  return {
    command: 'read',
    pattern:
      command.pattern,
    exclude:
      command.exclude
      ?? [],
    lines:
      command.lines
      ?? defaultLines,
    sizeKb:
      command.sizeKb
      ?? defaultSizeKb,
    readToEnd:
      command.readToEnd
      ?? false,
    withBinaryB64:
      command.withBinaryB64
      ?? false
  };
}

function getUpdateCommand(
    target: ReadTarget,
    command: ReadParameters
  ): ReadParameters
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
  const logger =
    createLogger();

  try {
    const resolver =
      new LocationResolver(
        logger,
        process.cwd());

    const matches =
      await resolver.resolve(
        process.cwd(),
        { patterns:
            [pattern],
          exclude:
            excludes });

    return matches
      .map(
        match =>
          path.resolve(
            match))
      .sort()
      .map(
        diskPath => ({
          path:
            toDisplayPath(
              diskPath,
              pattern),
          diskPath
        }));
  } finally {
    logger.dispose();
  }
}

function toDisplayPath(
    diskPath: string,
    pattern: string
  ): string
{
  if (path.isAbsolute(
      pattern)) {
    return diskPath;
  }

  return stripDotSlash(
    normalizeSlashes(
      path.relative(
        process.cwd(),
        diskPath)));
}

async function getEnvelopeFile(
    target: ReadTarget,
    update: ReadParameters,
    limits: ReadLimits
  ): Promise<EnvelopeFile>
{
  const data =
    await fsp.readFile(
      target.diskPath);

  let content: string;

  try {
    content =
      textDecoder.decode(
        data);
  } catch {
    if (limits.withBinaryB64) {
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
      limits);

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
    limits: ReadLimits
  ): {
    content: string;
    complete: boolean;
  }
{
  if (limits.readToEnd) {
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
    limits.sizeKb * 1024;

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

  if (lines.length > limits.lines) {
    limitedContent =
      lines
        .slice(
          0,
          limits.lines)
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
