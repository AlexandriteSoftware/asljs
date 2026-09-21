import path
  from 'node:path';
import { Command }
  from 'commander';
import { execBacklinks }
  from './commands/backlinks.js';
import { execConfig }
  from './commands/config.js';
import { execCopy }
  from './commands/copy.js';
import { execExtract }
  from './commands/extract.js';
import { execFormat }
  from './commands/format.js';
import { execGraph }
  from './commands/graph.js';
import { execInfo }
  from './commands/info.js';
import { execList }
  from './commands/list.js';
import { execMkdir }
  from './commands/mkdir.js';
import { execMove }
  from './commands/move.js';
import { execNew }
  from './commands/new.js';
import { execRead }
  from './commands/read.js';
import { execRemove }
  from './commands/remove.js';
import { execSearch }
  from './commands/search.js';
import { execVersion }
  from './commands/version.js';
import { execWrite }
  from './commands/write.js';
import { createEnvironment,
         Environment }
  from './environment.js';
import { filterStringOption,
         splitCommaSeparatedOption }
  from './formatting.js';
import { resolveLibraryRoot }
  from './library.js';
import { createLoggerProvider }
  from './logger.js';

/**
 * Run the `kb` command line interface.
 *
 * Returns 0 on success and 1 on failure. Commands that report a negative
 * outcome, such as `search` without matches, set `environment.exitCode`
 * instead.
 */
export async function runCli(
    args: string[],
    environment: Environment | null = null
  ): Promise<number>
{
  const ownEnvironment = !environment;

  environment =
    environment
    ?? createEnvironment();

  const cli =
    createCli(environment);

  if (args.length === 0) {
    cli.outputHelp();

    return 0;
  }

  try {
    await cli.parseAsync(
      args,
      { from: 'user' });

    return 0;
  } catch (error) {
    if (
      writeCommanderError(
        environment,
        error,
        cli)
    ) {
      return 1;
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (message) {
      environment.stderr.write(
        `${message}\n`);
    }

    return 1;
  } finally {
    if (ownEnvironment) {
      await environment.dispose();
    }
  }
}

function createCli(
    environment: Environment
  ): Command
{
  const cli =
    new Command();

  cli.name('kb')
    .description(
      '`kb` manages a markdown knowledge base library.')
    .allowExcessArguments(false)
    .helpCommand(false)
    .configureOutput(
      { writeOut:
          value => environment.stdout.write(value),
        writeErr:
          value => environment.stderr.write(value),
        outputError: () => { } })
    .exitOverride(
      (
          error
        ) =>
      {
        throw error;
      })
    .option(
      '--loglevel <level>',
      'Log level: trace, debug, information, warning, error')
    .option(
      '--logfile <path>',
      'Write logs to file')
    .option(
      '--library <path>',
      'Path to the library root. Defaults to the current working directory.')
    .option(
      '--format <format>',
      'Output format: text or json')
    .hook(
      'preAction',
      (
          _,
          actionCommand
        ) =>
      {
        applyGlobalOptions(
          environment,
          actionCommand.optsWithGlobals());

        environment
          .loggerProvider
          .getLogger()
          .trace(
            `command ${actionCommand.name()}`);
      });

  cli.command('list')
    .description(
      'List library entries matching a glob pattern')
    .argument(
      '[pattern]',
      'Glob pattern, relative to the library root')
    .option(
      '--kind <kind>',
      'Restrict to file, folder or any')
    .option(
      '--hidden',
      'Include dot files and dot folders')
    .action(
      async (
          pattern,
          options,
          command
        ) =>
      {
        await environment.resolve(execList)(
          environment,
          { pattern,
            kind: options.kind,
            hidden: options.hidden === true,
            format:
              formatOption(command) });
      });

  cli.command('read')
    .description(
      'Print the text of a document')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (
          value,
          _,
          command
        ) =>
      {
        await environment.resolve(execRead)(
          environment,
          { path: value,
            format:
              formatOption(command) });
      });

  cli.command('write')
    .description(
      'Write a text file, creating missing folders')
    .argument(
      '<path>',
      'Library-relative path')
    .option(
      '--content <text>',
      'Text to write. Read from stdin when omitted.')
    .option(
      '--overwrite',
      'Replace the file when it already exists')
    .action(
      async (
          value,
          options,
          command
        ) =>
      {
        await environment.resolve(execWrite)(
          environment,
          { path: value,
            content: options.content,
            overwrite: options.overwrite === true,
            format:
              formatOption(command) });
      });

  cli.command('new')
    .description(
      'Create a markdown note with front matter')
    .argument(
      '<path>',
      'Library-relative path. `.md` is added when missing.')
    .option(
      '--title <title>',
      'Note title. Defaults to the file name.')
    .option(
      '--tags <tags>',
      'Comma-separated tags')
    .option(
      '--body <text>',
      'Body text placed under the heading')
    .option(
      '--overwrite',
      'Replace the note when it already exists')
    .action(
      async (
          value,
          options,
          command
        ) =>
      {
        await environment.resolve(execNew)(
          environment,
          { path: value,
            title:
              filterStringOption(options.title),
            tags:
              splitCommaSeparatedOption(options.tags),
            body: options.body,
            overwrite: options.overwrite === true,
            format:
              formatOption(command) });
      });

  cli.command('mkdir')
    .description(
      'Create a folder, including missing parents')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (
          value,
          _,
          command
        ) =>
      {
        await environment.resolve(execMkdir)(
          environment,
          { path: value,
            format:
              formatOption(command) });
      });

  cli.command('move')
    .description(
      'Move or rename a file or folder')
    .argument('<source>')
    .argument('<target>')
    .option(
      '--overwrite',
      'Replace the target when it already exists')
    .action(
      async (
          source,
          target,
          options,
          command
        ) =>
      {
        await environment.resolve(execMove)(
          environment,
          { source,
            target,
            overwrite: options.overwrite === true,
            format:
              formatOption(command) });
      });

  cli.command('copy')
    .description(
      'Copy a file or folder')
    .argument('<source>')
    .argument('<target>')
    .option(
      '--overwrite',
      'Replace the target when it already exists')
    .action(
      async (
          source,
          target,
          options,
          command
        ) =>
      {
        await environment.resolve(execCopy)(
          environment,
          { source,
            target,
            overwrite: options.overwrite === true,
            format:
              formatOption(command) });
      });

  cli.command('remove')
    .description(
      'Remove a file or folder')
    .argument(
      '<path>',
      'Library-relative path')
    .option(
      '--recursive',
      'Remove a folder with its content')
    .action(
      async (
          value,
          options,
          command
        ) =>
      {
        await environment.resolve(execRemove)(
          environment,
          { path: value,
            recursive: options.recursive === true,
            format:
              formatOption(command) });
      });

  cli.command('search')
    .description(
      'Search the text of every readable document')
    .argument(
      '<query>',
      'Text to find, or a regular expression with --regex')
    .option(
      '--pattern <pattern>',
      'Glob pattern limiting the files to search')
    .option(
      '--regex',
      'Treat the query as a regular expression')
    .option(
      '--case-sensitive',
      'Match case exactly')
    .option(
      '--hidden',
      'Include dot files and dot folders')
    .option(
      '--max-results <count>',
      'Maximum number of matches to report')
    .action(
      async (
          query,
          options,
          command
        ) =>
      {
        await environment.resolve(execSearch)(
          environment,
          { query,
            pattern: options.pattern,
            regex: options.regex === true,
            caseSensitive:
              options.caseSensitive === true,
            hidden: options.hidden === true,
            maxResults:
              parseCountOption(
                options.maxResults,
                '--max-results'),
            format:
              formatOption(command) });
      });

  cli.command('backlinks')
    .description(
      'List the markdown links that point at an entry')
    .argument(
      '<path>',
      'Library-relative path')
    .option(
      '--pattern <pattern>',
      'Glob pattern limiting the documents to scan')
    .option(
      '--hidden',
      'Include dot files and dot folders')
    .option(
      '--include-self',
      'Include links the document makes to itself')
    .action(
      async (
          value,
          options,
          command
        ) =>
      {
        await environment.resolve(execBacklinks)(
          environment,
          { path: value,
            pattern: options.pattern,
            hidden: options.hidden === true,
            includeSelf: options.includeSelf === true,
            format:
              formatOption(command) });
      });

  cli.command('format')
    .description(
      'Format markdown files in place')
    .argument(
      '[pattern]',
      'Glob pattern. Defaults to **/*.md')
    .option(
      '--check',
      'Report files that need formatting without writing them')
    .option(
      '--hidden',
      'Include dot files and dot folders')
    .action(
      async (
          pattern,
          options,
          command
        ) =>
      {
        await environment.resolve(execFormat)(
          environment,
          { pattern,
            check: options.check === true,
            hidden: options.hidden === true,
            format:
              formatOption(command) });
      });

  cli.command('extract')
    .description(
      'Extract structured data from a markdown document')
    .argument(
      '<kind>',
      'headings, links, tasks, tables, code, front-matter or all')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (
          kind,
          value,
          _,
          command
        ) =>
      {
        await environment.resolve(execExtract)(
          environment,
          { path: value,
            kind,
            format:
              formatOption(command) });
      });

  cli.command('graph')
    .description(
      'Report the article and link collections')
    .argument(
      '[path]',
      'Library-relative path of an article to describe')
    .option(
      '--pattern <pattern>',
      'Glob pattern limiting the documents to index')
    .option(
      '--hidden',
      'Include dot files and dot folders')
    .action(
      async (
          value,
          options,
          command
        ) =>
      {
        await environment.resolve(execGraph)(
          environment,
          { path: value,
            pattern: options.pattern,
            hidden: options.hidden === true,
            format:
              formatOption(command) });
      });

  cli.command('info')
    .description(
      'Print a summary of a document')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (
          value,
          _,
          command
        ) =>
      {
        await environment.resolve(execInfo)(
          environment,
          { path: value,
            format:
              formatOption(command) });
      });

  cli.command('config')
    .description(
      'Print the effective configuration')
    .action(
      async (
          _,
          command
        ) =>
      {
        await environment.resolve(execConfig)(
          environment,
          { format:
              formatOption(command) });
      });

  cli.command('version')
    .description(
      'Print the current package version')
    .action(
      async () =>
      {
        await environment.resolve(execVersion)(
          environment);
      });

  return cli;
}

function applyGlobalOptions(
    environment: Environment,
    options: Record<string, unknown>
  ): void
{
  const level =
    filterStringOption(options.loglevel);

  const file =
    filterStringOption(options.logfile);

  const loggerProvider =
    createLoggerProvider(
      { ...(level === ''
          ? {}
          : { level }),
        ...(file === ''
          ? {}
          : { file }) });

  environment.onDispose(
    async (): Promise<void> =>
    {
      await loggerProvider.dispose();
    });

  environment.loggerProvider = loggerProvider;

  environment.library =
    resolveLibraryRoot(
      environment.cwd,
      filterStringOption(options.library));
}

function formatOption(
    command: Command
  ): string
{
  return filterStringOption(
    command.optsWithGlobals().format);
}

function parseCountOption(
    value: unknown,
    optionName: string
  ): number | undefined
{
  const text =
    filterStringOption(value);

  if (text === '') {
    return undefined;
  }

  const count =
    Number(text);

  if (
    !Number.isInteger(count)
    || count <= 0
  ) {
    throw new Error(
      `Option ${optionName} requires a positive integer.`);
  }

  return count;
}

function writeCommanderError(
    environment: Environment,
    error: unknown,
    cli: Command
  ): boolean
{
  if (!(error instanceof Error)) {
    return false;
  }

  const code =
    (error as Error & { code?: string; }).code;

  if (
    typeof code
    !== 'string'
  ) {
    return false;
  }

  if (
    code
    === 'commander.optionMissingArgument'
  ) {
    const optionName =
      tryExtractOptionName(error.message);

    environment.stderr.write(
      `${
        optionName
          ? `Option ${optionName} requires a value.`
          : 'Option requires a value.'}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownOption'
  ) {
    const optionName =
      tryExtractOptionName(error.message);

    environment.stderr.write(
      `${
        optionName
          ? `Unknown option: ${optionName}.`
          : 'Unknown option.'}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownCommand'
    || code
       === 'commander.missingArgument'
    || code
       === 'commander.excessArguments'
  ) {
    environment.stderr.write(
      `${error.message}\n`);

    cli.outputHelp(
      { error: true });

    return true;
  }

  if (code === 'commander.help') {
    cli.outputHelp(
      { error: true });

    return true;
  }

  return false;
}

function tryExtractOptionName(
    message: string
  ): string | null
{
  const match =
    /'(--[^ <']+)/.exec(message);

  const group =
    match?.[1]?.trim();

  if (
    !group
    || group === ''
  ) {
    return null;
  }

  return group;
}
