import { createLoggerProvider }
  from 'asljs-logging';
import { Command }
  from 'commander';
import { existsSync }
  from 'node:fs';
import path
  from 'node:path';
import { execCheck }
  from './commands/check.js';
import { execConfig }
  from './commands/config.js';
import { execDefinition }
  from './commands/definition.js';
import { execDefinitions }
  from './commands/definitions.js';
import { execDiagram }
  from './commands/diagram.js';
import { execInventory }
  from './commands/inventory.js';
import { execVersion }
  from './commands/version.js';
import { createEnvironment,
         Environment }
  from './environment.js';

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
    createCli(
      environment);

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

    if (!message) {
      return 1;
    }

    environment.stderr.write(
      `${message}\n`);

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

  cli.name('part')
    .description(
      '`part` is a project artefact tracing tool.')
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
      '--logfile <target>',
      'Where logs go: a file path, stdout or stderr')
    .option(
      '--logformat <format>',
      'Log format: auto, json, text or pretty')
    .option(
      '--definitions <source>',
      'Definition source: an md-only folder, a plugin library folder (has package.json), a plugin file, or a package name, optionally followed by ;<include>;<exclude> comma-separated definition name patterns. Repeat for several sources.',
      collectOption,
      [ ])
    .option(
      '--project <path>',
      'Path to artefact directory. Defaults to the current working directory.')
    .hook(
      'preAction',
      (
          _,
          actionCommand
        ) =>
      {
        const options =
          actionCommand.optsWithGlobals();

        // Silent unless asked; see docs/Logging.md at the repository root.
        const loggerProvider =
          createLoggerProvider(
            'PART_LOG_',
            { level:
                filterStringOption(options.loglevel),
              file:
                filterStringOption(options.logfile),
              format:
                filterStringOption(options.logformat) });

        environment.onDispose(
          async (): Promise<void> =>
          {
            await loggerProvider.dispose();
          });

        environment.loggerProvider = loggerProvider;

        const optDefinitions =
          (options.definitions as string[])
          .map(filterStringOption)
          .filter(
            value => value !== '');

        environment.definitions =
          (optDefinitions.length > 0
          ? optDefinitions
          : splitListVariable(
            process.env.PART_DEFINITIONS))
          .map(
            resolveDefinitionSource);

        const optProject =
          filterStringOption(
            options.project);

        if (optProject !== '') {
          environment.project =
            path.normalize(
              path.resolve(
                optProject));
        } else {
          const envProject =
            filterStringOption(
              process.env.PART_PROJECT);

          if (envProject !== '') {
            environment.project =
              path.normalize(
                path.resolve(
                  envProject));
          } else {
            environment.project = environment.cwd;
          }
        }
      });

  cli.command('inventory')
    .description(
      'Scan the current folder and print artefact inventory')
    .option(
      '--inventory-definitions <definitions>',
      'Comma-separated definition names to get inventory for')
    .option(
      '--format <format>',
      'Output format: table or json')
    .option(
      '--with-properties [properties]',
      'Include all definition properties in table output, or only the comma-separated <Definition>.<Property> list provided')
    .action(
      async (
          options
        ) =>
      {
        const method =
          environment.resolve(
            execInventory);

        const logger =
          environment
          .loggerProvider
          .getLogger(
            'execInventory');

        await method(
          logger,
          environment,
          { inventoryDefinitions:
              splitCommaSeparatedOption(
                options.inventoryDefinitions),
            format:
              filterStringOption(
                options.format),
            withProperties:
              parseWithPropertiesOption(
                options.withProperties) });
      });

  cli.command('diagram')
    .description(
      'Print the diagram a diagram document describes')
    .argument(
      'document')
    .option(
      '--format <format>',
      'Output format: mermaid (default) or svg')
    .option(
      '--write',
      'Write the Mermaid text into the Diagram section of the document')
    .option(
      '--check',
      'Fail when the Diagram section of the document is not current')
    .action(
      async (
          document,
          options
        ) =>
      {
        const method =
          environment.resolve(
            execDiagram);

        const logger =
          environment
          .loggerProvider
          .getLogger(
            'execDiagram');

        await method(
          logger,
          environment,
          { document,
            format:
              filterStringOption(
                options.format),
            write: options.write === true,
            check: options.check === true });
      });

  cli.command('definition')
    .description(
      'List definitions and their locations')
    .argument(
      'target')
    .action(
      async (
          target
        ) =>
      {
        const method =
          environment.resolve(
            execDefinition);

        await method(
          environment,
          { target });
      });

  cli.command('definitions')
    .description(
      'List definitions and their locations')
    .action(
      async () =>
      {
        const method =
          environment.resolve(
            execDefinitions);

        await method(
          environment);
      });

  cli.command('check')
    .description(
      'Run rules for artefacts matching a pattern')
    .argument('[pattern]')
    .option(
      '--check-definitions <definitions>',
      'Comma-separated definition names to run checks for')
    .option(
      '--check-rules <rules>',
      'Comma-separated rule names to check')
    .option(
      '--with-positives',
      'Show passing and failing check rows')
    .option(
      '--with-skipped',
      'Show rows of rules no plugin implements')
    .option(
      '--force-check',
      'Run every rule, ignoring results cached in .part/check-cache.json')
    .option(
      '--ai [agent]',
      'Check rules no plugin implements with an AI agent: claude (default) or copilot')
    .action(
      async (
          pattern,
          options
        ) =>
      {
        const method =
          environment.resolve(
            execCheck);

        const logger =
          environment
          .loggerProvider
          .getLogger(
            'execCheck');

        await method(
          logger,
          environment,
          { pattern,
            checkDefinitions:
              splitCommaSeparatedOption(
                options.checkDefinitions),
            checkRules:
              splitCommaSeparatedOption(
                options.checkRules),
            withPositives:
              options.withPositives === true,
            withSkipped: options.withSkipped === true,
            forceCheck: options.forceCheck === true,
            ai:
              options.ai === true
              ? 'claude'
              : typeof options.ai === 'string'
              ? options.ai
              : undefined });
      });

  cli.command('version')
    .description(
      'Print the current package version')
    .action(
      async () =>
      {
        const method =
          environment.resolve(
            execVersion);

        await method(
          environment);
      });

  cli.command('config')
    .description(
      'Print the configuration')
    .action(
      async () =>
      {
        const method =
          environment.resolve(
            execConfig);

        await method(
          environment);
      });

  return cli;
}

function writeCommanderError(
    environment: Environment,
    error: any,
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
      tryExtractOptionName(
        error.message);

    const text =
      optionName
      ? `Option ${optionName} requires a value.`
      : 'Option requires a value.';

    environment.stderr
      .write(
        `${text}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownOption'
  ) {
    const optionName =
      tryExtractOptionName(
        error.message);

    const text =
      optionName
      ? `Unknown option: ${optionName}.`
      : 'Unknown option.';

    environment.stderr
      .write(
        `${text}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownCommand'
  ) {
    environment.stderr
      .write(
        `Unknown command.\n`);

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

  if (
    !match
    || match.length < 2
  ) {
    return null;
  }

  const group = match[1];

  if (!group) {
    return null;
  }

  const trimmed =
    group.trim();

  if (trimmed === '') {
    return null;
  }

  return trimmed;
}

/**
 * Convert a comma-separated option value into an array of trimmed strings,
 * ignoring empty entries.
 */
function splitCommaSeparatedOption(
    value: unknown
  ): string[]
{
  if (
    typeof value
    !== 'string'
    || value.trim() === ''
  ) {
    return [ ];
  }

  return value
    .split(',')
    .map(
      entry => entry.trim())
    .filter(
      entry => entry.length > 0);
}

function collectOption(
    value: string,
    previous: string[]
  ): string[]
{
  return [ ...previous,
           value ];
}

/**
 * Split `PART_DEFINITIONS` into entries separated by newlines or `|`, ignoring
 * empty entries. `;` and `,` belong to the definition filter of an entry.
 */
function splitListVariable(
    value: unknown
  ): string[]
{
  return filterStringOption(value)
    .split(/\r?\n|\|/)
    .map(
      entry => entry.trim())
    .filter(
      entry => entry.length > 0);
}

/**
 * Resolves the source of a `<source>[;<include>[;<exclude>]]` value and keeps
 * its filter. A source that is absolute, starts with `.`, or exists becomes an
 * absolute path, resolved from the working directory; any other source is a
 * package specifier, kept for resolution from the project root.
 */
function resolveDefinitionSource(
    value: string
  ): string
{
  const separatorIndex =
    value.indexOf(';');

  const specifier =
    (separatorIndex < 0
    ? value
    : value.slice(
      0,
      separatorIndex))
    .trim();

  const filter =
    separatorIndex < 0
    ? ''
    : value.slice(separatorIndex);

  if (
    path.isAbsolute(specifier)
    || specifier.startsWith('.')
    || existsSync(specifier)
  ) {
    return path.normalize(
      path.resolve(
        specifier))
      + filter;
  }

  return specifier + filter;
}

/**
 * Normalise option value, by trimming whitespace and returning an empty string
 * for non-string values.
 */
function filterStringOption(
    value: unknown
  ): string
{
  if (
    typeof value
    !== 'string'
  ) {
    return '';
  }

  return value.trim();
}

function parseWithPropertiesOption(
    value: unknown
  ): true | string[] | undefined
{
  if (value === true) {
    return true;
  }

  if (
    typeof value
    !== 'string'
  ) {
    return undefined;
  }

  const items =
    splitCommaSeparatedOption(value);

  if (items.length === 0) {
    return true;
  }

  return items;
}
