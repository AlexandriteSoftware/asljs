import fs
  from 'node:fs';
import fsPromises
  from 'node:fs/promises';
import path
  from 'node:path';
import { start }
  from './process.js';

/**
 * The name of the generated dprint configuration.
 *
 * It sits in the working directory rather than a temporary one so that the
 * relative paths it holds resolve against the files they name, and it is
 * removed again once dprint has run.
 */
const GENERATED_CONFIG_NAME =
  '.toolkit-dprint.json';

/**
 * The longest command built before the file list is split.
 *
 * `cmd.exe` refuses a command line over 8191 characters, and the limit counts
 * the executable and its options too, so the budget is for the paths alone.
 */
const COMMAND_LENGTH_BUDGET = 6000;

/**
 * The `dprint.json` nearest to `startDir`, looking there and then upwards.
 *
 * A package may hold its own, and the repository root holds the one every
 * package extends, so the nearest is the one that applies.
 */
export function findDprintConfig(
    startDir: string
  ): string
{
  let current =
    path.resolve(startDir);

  while (
    !fs.existsSync(
      path.join(
        current,
        'dprint.json'))
  ) {
    const parentDir =
      path.dirname(current);

    if (parentDir === current) {
      throw new Error(
        `Cannot locate dprint.json in ${startDir} or any directory above it.`);
    }

    current = parentDir;
  }

  return path.join(
    current,
    'dprint.json');
}

/**
 * A dprint configuration naming exactly the files to format.
 *
 * Passing the list this way keeps the command short enough to read in a log,
 * and leaves it unbounded by the command line limit. Each path is anchored
 * with a leading slash because dprint matches an unanchored pattern at any
 * depth, which would reach the same file name inside every package.
 */
export function toDprintConfig(
    dprintConfigPath: string,
    filePaths: readonly string[]
  ): string
{
  const config =
    { extends:
        toPosixPath(
          dprintConfigPath),
      includes:
        filePaths.map(
          filePath =>
        `/${
          toPosixPath(
            filePath)
        }`) };

  return `${
    JSON.stringify(
      config,
      null,
      2)
  }\n`;
}

/** The file list split into runs that fit one command line. */
export function toCommandBatches(
    filePaths: readonly string[],
    budget: number = COMMAND_LENGTH_BUDGET
  ): string[][]
{
  const batches: string[][] = [ ];

  let batch: string[] = [ ];
  let length = 0;

  for (const filePath of filePaths) {
    // Each path is quoted and separated by a space.
    const cost =
      filePath.length
      + 3;

    if (
      batch.length > 0
      && length + cost
         > budget
    ) {
      batches.push(batch);

      batch = [ ];
      length = 0;
    }

    batch.push(filePath);

    length += cost;
  }

  if (batch.length > 0) {
    batches.push(batch);
  }

  return batches;
}

/** Formats the files with dprint, through a configuration written for the run. */
export async function formatWithDprint(
    dprintConfigPath: string,
    filePaths: readonly string[],
    cwd: string
  ): Promise<void>
{
  if (filePaths.length === 0) {
    return;
  }

  const generatedConfigPath =
    path.join(
      cwd,
      GENERATED_CONFIG_NAME);

  await fsPromises.writeFile(
    generatedConfigPath,
    toDprintConfig(
      dprintConfigPath,
      filePaths),
    'utf8');

  try {
    start(
      `dprint fmt --config "${GENERATED_CONFIG_NAME}"`,
      { cwd });
  } finally {
    await fsPromises.rm(
      generatedConfigPath,
      { force: true });
  }
}

/**
 * Formats the files with sfmt, after dprint.
 *
 * sfmt takes its files as glob patterns, so each path is passed as a pattern
 * that matches only itself.
 */
export function formatWithSfmt(
    filePaths: readonly string[],
    cwd: string,
    onBatch: (count: number) => void
  ): void
{
  runInBatches(
    'sfmt format',
    filePaths,
    cwd,
    onBatch);
}

/**
 * Lints the files with eslint, fixing what it can when `fix` is set.
 *
 * eslint finds its own nearest `eslint.config.*` by searching upwards. A file
 * that configuration ignores is passed over without a warning, because the file
 * list comes from git rather than from eslint.
 */
export function lintWithEslint(
    filePaths: readonly string[],
    cwd: string,
    fix: boolean,
    onBatch: (count: number) => void
  ): void
{
  runInBatches(
    fix
      ? 'eslint --no-warn-ignored --fix'
      : 'eslint --no-warn-ignored',
    filePaths,
    cwd,
    onBatch);
}

/**
 * Lints the files with remark.
 *
 * It finds its own `.remarkrc*` by searching upwards, so the nearest one wins.
 */
export function lintWithRemark(
    filePaths: readonly string[],
    cwd: string,
    onBatch: (count: number) => void
  ): void
{
  runInBatches(
    'remark --frail --quiet --no-stdout',
    filePaths,
    cwd,
    onBatch);
}

/**
 * Runs the command with the files as arguments.
 *
 * sfmt, eslint and remark have no configuration key for their files, so the
 * list is carried on the command line and split to stay within its limit. The
 * command is left out of the log, which records the count instead.
 */
function runInBatches(
    command: string,
    filePaths: readonly string[],
    cwd: string,
    onBatch: (count: number) => void
  ): void
{
  for (const batch of toCommandBatches(filePaths)) {
    const quotedPaths =
      batch
      .map(
        filePath => `"${filePath}"`)
      .join(' ');

    onBatch(batch.length);

    start(
      `${command} ${quotedPaths}`,
      { cwd,
        quiet: true });
  }
}

/** A path with forward slashes, which is what globs and dprint expect. */
function toPosixPath(
    filePath: string
  ): string
{
  return filePath.replaceAll(
    '\\',
    '/');
}
