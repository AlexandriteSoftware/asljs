import { type Logger }
  from 'asljs-logging';
import { type FileSelection,
         groupByExtension,
         locateFiles }
  from '../lib/files.js';
import { findDprintConfig,
         formatWithDprint,
         lintWithRemark }
  from '../lib/formatters.js';

export function parseFintArgs(
    args: readonly string[] = [ ]
  ): FileSelection
{
  const includes: string[] = [ ];
  const excludes: string[] = [ ];

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

    if (arg.startsWith('--')) {
      throw new Error(
        `Unknown option: ${arg}`);
    }

    includes.push(arg);
  }

  return { includes,
           excludes };
}

export async function fint(
    logger: Logger,
    args?: string[]
  ): Promise<void>
{
  const selection =
    parseFintArgs(args);

  const cwd =
    process.cwd();

  const files =
    await locateFiles(
      logger,
      cwd,
      selection);

  const markdown =
    groupByExtension(
      files,
      [ '.md' ]);

  const json =
    groupByExtension(
      files,
      [ '.json' ]);

  logger.information(
    'fint: %d markdown and %d json files',
    markdown.length,
    json.length);

  const dprintConfigPath =
    findDprintConfig(cwd);

  await formatWithDprint(
    dprintConfigPath,
    json,
    cwd);

  if (markdown.length === 0) {
    return;
  }

  // Formatting first means the linter reports what the file now holds, not
  // what it held before dprint rewrapped it.
  await formatWithDprint(
    dprintConfigPath,
    markdown,
    cwd);

  lintWithRemark(
    markdown,
    cwd,
    count =>
      logger.information(
        'fint: remark on %d files',
        count));
}
