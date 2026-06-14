import path
  from 'node:path';
import { createLogger }
  from './logging.js';
import { Command }
  from 'commander';
import { execInit }
  from './commands/init.js';
import { execUpdate }
  from './commands/update.js';
import { execInventory }
  from './commands/inventory.js';
import { execDefinitions }
  from './commands/definitions.js';
import { execCheck }
  from './commands/check.js';
import { execDefinition }
  from './commands/definition.js';
import { execVersion }
  from './commands/version.js';

export async function runCli(
  args,
  environment)
{
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

    return cli.exitCode ?? 0;
  } catch (error) {
    if (
      writeCommanderError(
        environment,
        error,
        args,
        cli))
    {
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
  }
}

function createCli(
  environment)
{
  const cli =
    new Command();

  cli.name('part')
    .description(
      '`part` is a project artefact tracing tool.')
    .allowExcessArguments(false)
    .helpCommand(false)
    .configureOutput(
      { writeOut: value => environment.stdout.write(value),
        writeErr: value => environment.stderr.write(value),
        outputError: () => { } })
    .exitOverride(
      error => { throw error; })
    .option(
      '--loglevel <level>',
      'Log level: trace, debug, information, warning, error',
      'information')
    .option(
      '--logfile <path>',
      'Write logs to file')
    .option(
      '--log',
      'Enables logging')
    .option(
      '--definitions <path>',
      'Path to artefact definitions directory. Defaults to the current working directory.')
    .hook(
      'preAction',
      (_, actionCommand) => {
        const options =
          actionCommand.optsWithGlobals();

        const loggerOptions =
          { enabled: options.log,
            level: options.loglevel,
            file: options.logfile };

        const logger =
          createLogger(
            loggerOptions);

        environment.logger = logger;

        logger.trace(
          `Initialised logger with ${JSON.stringify(loggerOptions)}`);

        logger.info(
          `Started app with ${JSON.stringify(options)}`);

        if (
          options.definitions !== undefined
          && options.definitions !== null
          && options.definitions.trim() !== '')
        {
          environment.definitions =
            path.resolve(
              options.definitions);
        } else {
          environment.definitions =
            environment.cwd;
        }
      });      

  cli.command('inventory')
    .description(
      'Scan the current folder and print artefact inventory')
    .action(
      async () => {
        const method =
          environment.resolve(
            execInventory);

        const result =
          await method(
            environment);

        updateExitCode(
          cli,
          result);
      });

  cli.command('definition')
    .description(
      'List definitions and their locations')
    .argument(
      'target')
    .action(
      async target => {
        const method =
          environment.resolve(
            execDefinition);

        const result =
          await method(
            environment,
            { target });

        updateExitCode(
          cli,
          result);
    });

  cli.command('definitions')
    .description(
      'List definitions and their locations')
    .action(
      async () => {
        const method =
          environment.resolve(
            execDefinitions);

        const result =
          await method(
            environment);

        updateExitCode(
          cli,
          result);
    });

  cli.command('init')
    .description(
      'Initialize an artefact definitions directory')
    .action(
      async () => {
        const method =
          environment.resolve(
            execInit);

        const result =
          await method(
            environment);

        updateExitCode(
          cli,
          result);
      });

  cli.command('update')
    .description(
      'Create or refresh JS rule files from artefact definitions')
    .option(
      '--dry-run',
      'Print Copilot prompts without running them or writing files')
    .action(
      async (options) => {
        const method =
          environment.resolve(
            execUpdate);

        const result =
          await method(
            environment,
            options);

        updateExitCode(
          cli,
          result);
      });

  cli.command('check')
    .description(
      'Run rules for artefacts matching a pattern')
    .argument('[pattern]')
    .option(
      '--check-definitions <definitions>',
      'Comma-separated definition names to include')
    .option(
      '--check-rules <rules>',
      'Comma-separated rule names to include')
    .option(
      '--with-positives',
      'Show passing and failing check rows')
    .action(
      async (pattern, options) => {
        const method =
          environment.resolve(
            execCheck);

        const result =
          await method(
            environment,
            { pattern,
              definitionNames:
                splitCommaSeparatedOption(
                  options.checkDefinitions),
              ruleNames:
                splitCommaSeparatedOption(
                  options.checkRules),
              withPositives:
                options.withPositives === true });

        updateExitCode(
          cli,
          result);
      });

  cli.command('version')
    .description(
      'Print the current package version')
    .action(
      async () => {
        const method =
          environment.resolve(
            execVersion);

        const result =
          await method(
            environment);

        updateExitCode(
          cli,
          result);
      });

  return cli;
}

function writeCommanderError(
  environment,
  error,
  args,
  cli)
{
  if (!(error instanceof Error)
      || typeof error.code !== 'string')
  {
    return false;
  }

  if (error.code === 'commander.optionMissingArgument') {
    const optionName =
      extractOptionName(
        error.message);

    environment.stderr.write(
      `Option ${optionName} requires a value.\n`);

    return true;
  }

  if (error.code === 'commander.unknownOption') {
    const optionName =
      extractOptionName(
        error.message);

    environment.stderr.write(
      `Unknown option: ${optionName}\n`);

    return true;
  }

  if (error.code === 'commander.unknownCommand') {
    const commandName =
      args[0] ?? '';

    environment.stderr.write(
      `Unknown command: ${commandName}\n`);

    cli.outputHelp(
      { error: true });

    return true;
  }

  return false;
}

function extractOptionName(message)
{
  const match =
    /'(--[^ <']+)/.exec(message);

  return match?.[1] ?? '--unknown';
}

function splitCommaSeparatedOption(value)
{
  if (typeof value !== 'string'
      || value.trim() === '')
  {
    return [];
  }

  return value
    .split(',')
    .map(
      entry => entry.trim())
    .filter(
      entry => entry.length > 0);
}

function updateExitCode(
  cli,
  result)
{
  cli.exitCode =
    result.hasFailures
    ? 1
    : 0;
}