import { Command }
  from 'commander';
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
import { execInit }
  from './commands/init.js';
import { execInventory }
  from './commands/inventory.js';
import { execUpdate }
  from './commands/update.js';
import { execVersion }
  from './commands/version.js';
import { createEnvironment,
         Environment }
  from './environment.js';
import { createPinoLoggerProvider,
         LoggerOptions }
  from './logging/pino.js';

export async function runCli(
    args: string[],
    environment: Environment | null = null
  ): Promise<number>
{
  const ownEnvironment = !environment;

  environment = environment
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
      {
        writeOut: value => environment.stdout.write(value),
        writeErr: value => environment.stderr.write(value),
        outputError: () =>
        {}
      })
    .exitOverride(
      error =>
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
      '--definitions <path>',
      'Path to artefact definitions directory. Defaults to the current working directory.')
    .option(
      '--project <path>',
      'Path to artefact directory. Defaults to the current working directory.')
    .hook(
      'preAction',
      (_, actionCommand) =>
      {
        const options =
          actionCommand.optsWithGlobals();

        const loggerOptions: Partial<LoggerOptions> =
          {
          envVarPrefix: 'PART_LOG_'
        };

        if (options.loglevel) {
          loggerOptions.level = options.loglevel;
        }

        if (options.logfile) {
          loggerOptions.file = options.logfile;
        }

        const loggerProvider =
          createPinoLoggerProvider(
            loggerOptions);

        environment.onDispose(
          async (): Promise<void> =>
          {
            await loggerProvider.dispose();
          });

        environment.loggerProvider = loggerProvider;

        const optDefinitions =
          filterStringOption(
            options.definitions);

        if (optDefinitions !== '') {
          environment.definitions = path.normalize(
            path.resolve(
              optDefinitions));
        } else {
          const envDefinitions =
            filterStringOption(
              process.env.PART_DEFINITIONS);

          if (envDefinitions !== '') {
            environment.definitions = path.normalize(
              path.resolve(
                envDefinitions));
          } else {
            environment.definitions = environment.cwd;
          }
        }

        const optProject =
          filterStringOption(
            options.project);

        if (optProject !== '') {
          environment.project = path.normalize(
            path.resolve(
              optProject));
        } else {
          const envProject =
            filterStringOption(
              process.env.PART_PROJECT);

          if (envProject !== '') {
            environment.project = path.normalize(
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
    .action(
      async options =>
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
          {
            inventoryDefinitions: splitCommaSeparatedOption(
              options.inventoryDefinitions)
          });
      });

  cli.command('definition')
    .description(
      'List definitions and their locations')
    .argument(
      'target')
    .action(
      async target =>
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

  cli.command('init')
    .description(
      'Initialize an artefact definitions directory')
    .action(
      async () =>
      {
        const method =
          environment.resolve(
            execInit);

        await method(
          environment);
      });

  cli.command('update')
    .description(
      'Create or refresh JS rule files from artefact definitions')
    .option(
      '--dry-run',
      'Print Copilot prompts without running them or writing files')
    .action(
      async options =>
      {
        const method =
          environment.resolve(
            execUpdate);

        const logger =
          environment
          .loggerProvider
          .getLogger(
            'execUpdate');

        await method(
          logger,
          environment,
          options);
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
    .action(
      async (pattern, options) =>
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
          {
            pattern,
            checkDefinitions: splitCommaSeparatedOption(
              options.checkDefinitions),
            checkRules: splitCommaSeparatedOption(
              options.checkRules),
            withPositives: options.withPositives === true
          });
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

  if (typeof code !== 'string') {
    return false;
  }

  if (code === 'commander.optionMissingArgument') {
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

  if (code === 'commander.unknownOption') {
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

  if (code === 'commander.unknownCommand') {
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

  const group =
    match[1];

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
    typeof value !== 'string'
    || value.trim() === ''
  ) {
    return [];
  }

  return value
    .split(',')
    .map(
      entry => entry.trim())
    .filter(
      entry => entry.length > 0);
}

/**
 * Normalise option value, by trimming whitespace and returning an empty string
 * for non-string values.
 */
function filterStringOption(
    value: unknown
  ): string
{
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}
