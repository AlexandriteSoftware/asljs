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

  logger.information(
    'flint: %d json, %d markdown and %d script files',
    json.length,
    markdown.length,
    scripts.length);

  // Formatting first means the linters report what the files now hold, not
  // what they held before the formatters rewrote them. sfmt runs after dprint
  // because it refines dprint's layout.
  await formatWithDprint(
    findDprintConfig(cwd),
    [ ...json,
      ...markdown,
      ...typescript ],
    cwd);

  formatWithSfmt(
    typescript,
    cwd,
    count =>
      logger.information(
        'flint: sfmt on %d files',
        count));

  lintWithEslint(
    scripts,
    cwd,
    options.fix,
    count =>
      logger.information(
        'flint: eslint on %d files',
        count));

  lintWithRemark(
    markdown,
    cwd,
    count =>
      logger.information(
        'flint: remark on %d files',
        count));
}
