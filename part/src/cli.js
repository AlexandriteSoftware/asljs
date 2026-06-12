import { createRequire }
  from 'node:module';
import path
  from 'node:path';
import { Command }
  from 'commander';
import { initializeDefinitionsDirectory }
  from './init.js';
import { updateRules }
  from './updateRules.js';
import { buildArtefactDefinitionReport,
         buildCheckReport,
         buildInventoryReport }
  from './inventory.js';
import { createLogger }
  from './logging.js';

const packageVersion =
  (() => {
    const require =
      createRequire(
        import.meta.url);

    const { version } =
      require('../package.json');

    return version;
  })();

export async function runCli(
  args,
  environment)
{
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

    return cli.exitCode ?? 0;
  } catch (error) {
    if (writeCommanderError(environment, error, args, cli)) {
      return 1;
    }

    const message =
      error instanceof Error
      ? error.message
      : String(error);

    if (!message) {
      return 1;
    }

    environment.stderr.write(`${message}\n`);
    return 1;
  }
}

function createCli(
  environment)
{
  const cli = new Command();

  cli
    .name('part')
    .description('`part` is a project artefact tracing tool.')
    .allowExcessArguments(false)
    .helpCommand(false)
    .configureOutput(
      { writeOut: value => environment.stdout.write(value),
        writeErr: value => environment.stderr.write(value),
        outputError: () => { } })
    .exitOverride(error => { throw error; })
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
    .hook(
      'preAction',
      (thisCommand, actionCommand) => {
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
      });      

  cli.command('inventory')
    .description('Scan the current folder and print artefact inventory')
    .option(
      '--definitions <path>',
      'Search definitions in the specified folder only')
    .action(
      async (options) => {
        await writeReport(
          environment,
          await buildInventoryReport(
            environment.cwd,
            { definitionsPath: options.definitions }),
        );
      });

  cli.command('artefactdefinition')
    .description('List definitions and their locations')
    .argument('[definitionTarget]')
    .option(
      '--definitions <path>',
      'Search definitions in the specified folder only')
    .action(
      async (definitionTarget, options) => {
        await writeReport(
          environment,
          await buildArtefactDefinitionReport(
            environment.cwd,
            { definitionTarget,
            definitionsPath: options.definitions }),
      );
    });

  cli.command('init')
    .description('Initialize an artefact definitions directory')
    .option(
      '--definitions <path>',
      'Initialize the specified definitions directory')
    .action(
      async (options) => {
        const initializedPath =
          await initializeDefinitionsDirectory(
            environment.cwd,
            options.definitions);

        environment.stdout.write(`Initialized definitions directory: ${initializedPath}\n`);
      });

  cli.command('update-rules')
    .description('Create or refresh JS rule files from artefact definitions')
    .option(
      '--definitions <path>',
      'Search definitions in the specified folder only')
    .option(
      '--dry-run',
      'Print Copilot prompts without running them or writing files')
    .action(
      async (options) => {
        const result =
          await updateRules(
            environment.cwd,
            {
              definitionsPath: options.definitions,
              dryRun: options.dryRun,
              runCopilotCli: environment.runCopilotCli,
            },
          );

        if (result.updates.length === 0) {
          environment.stdout.write('No rule updates were needed.\n');
        }

        for (const update of result.updates) {
          environment.stdout.write(`${update}\n`);
        }

        for (const warning of result.warnings) {
          environment.stderr.write(`${warning}\n`);
        }

        if (options.dryRun) {
          for (const prompt of result.prompts) {
            environment.stdout.write(`\n--- ${prompt.mode.toUpperCase()} ${toPosixPath(path.relative(environment.cwd, prompt.targetFilePath))} ---\n`);
            environment.stdout.write(`${prompt.prompt}\n`);
          }
        }
      });

  cli.command('check')
    .description('Run rules for artefacts matching a pattern')
    .argument('[pattern]')
    .option(
      '--definitions <definitions>',
      'Comma-separated definition names to include')
    .option(
      '--rules <rules>',
      'Comma-separated rule names to include')
    .option(
      '--definitions-path <path>',
      'Search definitions in the specified folder only')
    .option(
      '--with-positives',
      'Show passing and failing check rows')
    .action(
      async (pattern, options) => {
        const result =
          await buildCheckReport(
            environment.cwd,
            { pattern,
              definitionNames: splitCommaSeparatedOption(options.definitions),
              ruleNames: splitCommaSeparatedOption(options.rules),
              definitionsPath: options.definitionsPath,
              withPositives: options.withPositives === true });

        await writeReport(environment, result.report);

        cli.exitCode =
          result.hasFailures
          ? 1
          : 0;
      });

  cli.command('version')
    .description('Print the current package version')
    .action(
      () => environment.stdout.write(`${packageVersion}\n`));

  return cli;
}

async function writeReport(
  environment,
  report)
{
  environment.stdout.write(`${report}\n`);
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
    const optionName = extractOptionName(error.message);

    environment.stderr.write(
      `Option ${optionName} requires a value.\n`);
    return true;
  }

  if (error.code === 'commander.unknownOption') {
    const optionName = extractOptionName(error.message);

    environment.stderr.write(
      `Unknown option: ${optionName}\n`);
    return true;
  }

  if (error.code === 'commander.unknownCommand') {
    const commandName = args[0] ?? '';

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
  const match = /'(--[^ <']+)/.exec(message);

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
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);
}

function toPosixPath(value)
{
  return value.replaceAll('\\', '/');
}