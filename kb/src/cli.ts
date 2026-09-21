import { Command }
  from 'commander';
import { execBacklinks }
  from './commands/backlinks.js';
import { execConfig }
  from './commands/config.js';
import { CommandContext }
  from './commands/context.js';
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
import { execRename }
  from './commands/rename.js';
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
import { McpClient,
         openClient }
  from './mcp/client.js';

/**
 * Run the `kb` command line interface.
 *
 * Every command that touches the library is carried out by a server: a
 * running one when there is one, and otherwise one started for that command
 * and shut down afterwards. The CLI parses, asks, and renders.
 *
 * Returns 0 on success and 1 on failure. Commands that report a negative
 * outcome, such as `search` without matches, set `environment.exitCode`.
 */
export async function runCli(
    args: string[],
    environment: Environment | null = null
  ): Promise<number>
{
  const ownEnvironment = !environment;

  const active =
    environment
    ?? createEnvironment();

  const cli =
    createCli(active);

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
    return reportFailure(
      active,
      cli,
      error);
  } finally {
    if (ownEnvironment) {
      await active.dispose();
    }
  }
}

/**
 * Carry out one command through a server, and close the connection when it is
 * done. An internal server is shut down by that close.
 */
async function through<TOptions>(
    environment: Environment,
    action: (
      context: CommandContext,
      options: TOptions
    ) => Promise<void>,
    options: TOptions
  ): Promise<void>
{
  const resolved =
    environment.resolve(action);

  const client =
    await clientFor(environment);

  try {
    await resolved(
      { environment,
        client },
      options);
  } finally {
    await client.close();
  }
}

function clientFor(
    environment: Environment
  ): Promise<McpClient>
{
  if (environment.openClient) {
    return environment.openClient();
  }

  return openClient(environment.library);
}

function reportFailure(
    environment: Environment,
    cli: Command,
    error: unknown
  ): number
{
  if (
    writeCommanderError(
      environment,
      cli,
      error)
  ) {
    return 1;
  }

  const message =
    messageOf(error);

  if (message !== '') {
    environment.stderr.write(
      `${message}\n`);
  }

  return 1;
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
      });

  addLibraryCommands(
    cli,
    environment);

  addLinkCommands(
    cli,
    environment);

  addToolCommands(
    cli,
    environment);

  return cli;
}

function addLibraryCommands(
    cli: Command,
    environment: Environment
  ): void
{
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
      async (pattern, options, command) =>
      await through(
        environment,
        execList,
        { pattern,
          kind: options.kind,
          hidden: options.hidden === true,
          format:
            formatOption(command) }));

  cli.command('read')
    .description(
      'Print the text of a document')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (value, _, command) =>
      await through(
        environment,
        execRead,
        { path: value,
          format:
            formatOption(command) }));

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
      async (value, options, command) =>
      await through(
        environment,
        execWrite,
        { path: value,
          content: options.content,
          overwrite: options.overwrite === true,
          format:
            formatOption(command) }));

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
      async (value, options, command) =>
      await through(
        environment,
        execNew,
        { path: value,
          title:
            filterStringOption(options.title),
          tags:
            splitCommaSeparatedOption(options.tags),
          body: options.body,
          overwrite: options.overwrite === true,
          format:
            formatOption(command) }));

  cli.command('mkdir')
    .description(
      'Create a folder, including missing parents')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (value, _, command) =>
      await through(
        environment,
        execMkdir,
        { path: value,
          format:
            formatOption(command) }));

  cli.command('copy')
    .description(
      'Copy a file or folder')
    .argument('<source>')
    .argument('<target>')
    .option(
      '--overwrite',
      'Replace the target when it already exists')
    .action(
      async (source, target, options, command) =>
      await through(
        environment,
        execCopy,
        { source,
          target,
          overwrite: options.overwrite === true,
          format:
            formatOption(command) }));

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
      async (value, options, command) =>
      await through(
        environment,
        execRemove,
        { path: value,
          recursive: options.recursive === true,
          format:
            formatOption(command) }));
}

function addLinkCommands(
    cli: Command,
    environment: Environment
  ): void
{
  cli.command('move')
    .description(
      'Move a file or folder, rewriting the links it would break')
    .argument('<source>')
    .argument('<target>')
    .option(
      '--overwrite',
      'Replace the target when it already exists')
    .option(
      '--no-update-links',
      'Move without rewriting any link')
    .option(
      '--dry-run',
      'Report the move and the edits without performing them')
    .action(
      async (source, target, options, command) =>
      await through(
        environment,
        execMove,
        { source,
          target,
          overwrite: options.overwrite === true,
          updateLinks: options.updateLinks !== false,
          dryRun: options.dryRun === true,
          format:
            formatOption(command) }));

  cli.command('rename')
    .description(
      'Rename an entry in place, rewriting the links it would break')
    .argument(
      '<path>',
      'Library-relative path')
    .argument(
      '<name>',
      'New name, without a folder')
    .option(
      '--overwrite',
      'Replace the target when it already exists')
    .option(
      '--no-update-links',
      'Rename without rewriting any link')
    .option(
      '--dry-run',
      'Report the rename and the edits without performing them')
    .action(
      async (value, name, options, command) =>
      await through(
        environment,
        execRename,
        { path: value,
          name,
          overwrite: options.overwrite === true,
          updateLinks: options.updateLinks !== false,
          dryRun: options.dryRun === true,
          format:
            formatOption(command) }));

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
      async (value, options, command) =>
      await through(
        environment,
        execBacklinks,
        { path: value,
          pattern: options.pattern,
          hidden: options.hidden === true,
          includeSelf: options.includeSelf === true,
          format:
            formatOption(command) }));

  cli.command('graph')
    .description(
      'Report the article and link collections')
    .argument(
      '[path]',
      'Library-relative path of an article to describe')
    .action(
      async (value, _, command) =>
      await through(
        environment,
        execGraph,
        { path: value,
          format:
            formatOption(command) }));
}

function addToolCommands(
    cli: Command,
    environment: Environment
  ): void
{
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
      async (query, options, command) =>
      await through(
        environment,
        execSearch,
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
            formatOption(command) }));

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
      async (pattern, options, command) =>
      await through(
        environment,
        execFormat,
        { pattern,
          check: options.check === true,
          hidden: options.hidden === true,
          format:
            formatOption(command) }));

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
      async (kind, value, _, command) =>
      await through(
        environment,
        execExtract,
        { path: value,
          kind,
          format:
            formatOption(command) }));

  cli.command('info')
    .description(
      'Print a summary of a document')
    .argument(
      '<path>',
      'Library-relative path')
    .action(
      async (value, _, command) =>
      await through(
        environment,
        execInfo,
        { path: value,
          format:
            formatOption(command) }));

  cli.command('config')
    .description(
      'Print the effective configuration')
    .action(
      async (_, command) =>
      await environment.resolve(execConfig)(
        environment,
        { format:
            formatOption(command) }));

  cli.command('version')
    .description(
      'Print the current package version')
    .action(
      async () =>
      await environment.resolve(execVersion)(
        environment));
}

function applyGlobalOptions(
    environment: Environment,
    options: Record<string, unknown>
  ): void
{
  const loggerProvider =
    createLoggerProvider(
      loggerOptionsFrom(options));

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

function loggerOptionsFrom(
    options: Record<string, unknown>
  ): { level?: string; file?: string; }
{
  const resolved: { level?: string; file?: string; } = {};

  const level =
    filterStringOption(options.loglevel);

  if (level !== '') {
    resolved.level = level;
  }

  const file =
    filterStringOption(options.logfile);

  if (file !== '') {
    resolved.file = file;
  }

  return resolved;
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
    cli: Command,
    error: unknown
  ): boolean
{
  const code =
    commanderCode(error);

  if (code === null) {
    return false;
  }

  if (
    code
    === 'commander.optionMissingArgument'
  ) {
    environment.stderr.write(
      `${optionText(
        error,
        'requires a value')}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownOption'
  ) {
    environment.stderr.write(
      `${unknownOptionText(error)}\n`);

    return true;
  }

  if (code === 'commander.help') {
    cli.outputHelp(
      { error: true });

    return true;
  }

  if (isUsageError(code)) {
    environment.stderr.write(
      `${messageOf(error)}\n`);

    cli.outputHelp(
      { error: true });

    return true;
  }

  return false;
}

function isUsageError(
    code: string
  ): boolean
{
  return code === 'commander.unknownCommand'
    || code === 'commander.missingArgument'
    || code === 'commander.excessArguments';
}

function commanderCode(
    error: unknown
  ): string | null
{
  if (!(error instanceof Error)) {
    return null;
  }

  const code =
    (error as Error & { code?: string; }).code;

  if (
    typeof code
    !== 'string'
  ) {
    return null;
  }

  return code;
}

function optionText(
    error: unknown,
    suffix: string
  ): string
{
  const name =
    optionName(error);

  if (name === null) {
    return `Option ${suffix}.`;
  }

  return `Option ${name} ${suffix}.`;
}

function unknownOptionText(
    error: unknown
  ): string
{
  const name =
    optionName(error);

  if (name === null) {
    return 'Unknown option.';
  }

  return `Unknown option: ${name}.`;
}

function optionName(
    error: unknown
  ): string | null
{
  const match =
    /'(--[^ <']+)/.exec(
      messageOf(error));

  const group =
    match?.[1]?.trim();

  if (
    group === undefined
    || group === ''
  ) {
    return null;
  }

  return group;
}

function messageOf(
    error: unknown
  ): string
{
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
