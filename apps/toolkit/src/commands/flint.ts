import { type Logger }
  from 'asljs-logging';
import { type FileSelection,
         groupByExtension,
         locateFiles }
  from '../lib/files.js';
import { findDprintConfig,
         formatWithDprint,
         formatWithSfmt,
         lintWithEslint,
         lintWithRemark }
  from '../lib/formatters.js';
import { report }
  from '../lib/output.js';

/** What to look at, and whether eslint may fix what it reports. */
export interface FlintOptions extends FileSelection
{
  fix: boolean;
}

/** The files eslint lints. */
const SCRIPT_EXTENSIONS =
  [ '.ts',
    '.mts',
    '.cts',
    '.js',
    '.mjs',
    '.cjs' ];

/**
 * The files dprint and sfmt format.
 *
 * JavaScript is left as written: sfmt has no rules for it, so dprint alone
 * would undo the layout the hand-written scripts share with the TypeScript.
 */
const TYPESCRIPT_EXTENSIONS =
  [ '.ts',
    '.mts',
    '.cts' ];

/**
 * Records a tool's run: the count at information level, and each file at debug
 * level, so `--loglevel debug` shows exactly what the tool processed.
 */
function logRun(
    logger: Logger,
    tool: string,
    files: readonly string[]
  ): void
{
  report(
    'flint: %s on %d files',
    tool,
    files.length);

  if (!logger.isLevelEnabled('debug')) {
    return;
  }

  for (const file of files) {
    logger.debug(
      'flint: %s: %s',
      tool,
      file);
  }
}

export function parseFlintArgs(
    args: readonly string[] = [ ]
  ): FlintOptions
{
  const includes: string[] = [ ];
  const excludes: string[] = [ ];
  let fix = false;

  for (
    let index = 0;
    index < args.length;
    index += 1
  ) {
    const arg = args[index];

    if (arg === '--exclude') {
      const pattern = args[index + 1];

      if (
        pattern === undefined
        || pattern.startsWith('--')
      ) {
        throw new Error(
          '--exclude needs a glob.');
      }

      excludes.push(pattern);

      index += 1;

      continue;
    }

    if (arg === '--fix') {
      fix = true;

      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(
        `Unknown option: ${arg}`);
    }

    includes.push(arg);
  }

  return { includes,
           excludes,
           fix };
}

export async function flint(
    logger: Logger,
    args?: string[]
  ): Promise<void>
{
  const options =
    parseFlintArgs(args);

  const cwd =
    process.cwd();

  const files =
    await locateFiles(
      logger,
      cwd,
      options);

  const json =
    groupByExtension(
      files,
      [ '.json' ]);

  const markdown =
    groupByExtension(
      files,
      [ '.md' ]);

  const scripts =
    groupByExtension(
      files,
      SCRIPT_EXTENSIONS);

  const typescript =
    groupByExtension(
      files,
      TYPESCRIPT_EXTENSIONS);

  report(
    'flint: %d json, %d markdown and %d script files',
    json.length,
    markdown.length,
    scripts.length);

  // Formatting first means the linters report what the files now hold, not
  // what they held before the formatters rewrote them. sfmt runs after dprint
  // because it refines dprint's layout.
  const formatted =
    [ ...json,
      ...markdown,
      ...typescript ];

  if (formatted.length > 0) {
    logRun(
      logger,
      'dprint',
      formatted);
  }

  await formatWithDprint(
    findDprintConfig(cwd),
    formatted,
    cwd);

  formatWithSfmt(
    typescript,
    cwd,
    batch =>
      logRun(
        logger,
        'sfmt',
        batch));

  lintWithEslint(
    scripts,
    cwd,
    options.fix,
    batch =>
      logRun(
        logger,
        'eslint',
        batch));

  lintWithRemark(
    markdown,
    cwd,
    batch =>
      logRun(
        logger,
        'remark',
        batch));
}
