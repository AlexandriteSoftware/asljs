import path
  from 'node:path';
import { createLogger }
  from './logging.js';
import { createEnvironment }
  from './environment.js';
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

/**
 * @typedef
 *   { import('./environment.js')
 *       .Environment }
 *   Environment
 */

/**
 * @param {string[]} args 
 * @param {Environment?} environment 
 * @returns {Promise<number>}
 */
export async function runCli(
  args,
  environment = null)
{
  environment =
    environment
    ?? createEnvironment();

  environment.logger.trace(
    `CLI: args=${JSON.stringify(args)}`);

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

/**
 * @param {Environment} environment 
 */
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
      '--definitions <path>',
      'Path to artefact definitions directory. Defaults to the current working directory.')
    .option(
      '--project <path>',
      'Path to artefact directory. Defaults to the current working directory.')
    .hook(
      'preAction',
      (_, actionCommand) => {
        const options =
          actionCommand.optsWithGlobals();

        if (options.loglevel) {
          const loggerOptions =
            { level: options.loglevel,
              file: options.logfile };

          const logger =
            createLogger(
              loggerOptions);

          environment.logger = logger;
        }

        const optDefinitions =
          filterStringOption(
            options.definitions);

        if (optDefinitions !== '') {
          environment.definitions =
            path.normalize(
              path.resolve(
                optDefinitions));
        } else {
          const envDefinitions =
            filterStringOption(
              process.env.PART_DEFINITIONS);

          if (envDefinitions !== '') {
            environment.definitions =
              path.normalize(
                path.resolve(
                  envDefinitions));
          } else {
            environment.definitions =
              environment.cwd;
          }
        }

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
            environment.project =
              environment.cwd;
          }
        }

        environment.logger.trace(
          `CLI post-hook: definitions=${environment.definitions}, project=${environment.project}`);
      });

  cli.command('inventory')
    .description(
      'Scan the current folder and print artefact inventory')
    .option(
      '--inventory-definitions <definitions>',
      'Comma-separated definition names to get inventory for')
    .action(
      async (options) => {
        const method =
          environment.resolve(
            execInventory);

        await method(
          environment,
          { inventoryDefinitions:
              splitCommaSeparatedOption(
                options.inventoryDefinitions) });
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

        await method(
          environment,
          { target });
    });

  cli.command('definitions')
    .description(
      'List definitions and their locations')
    .action(
      async () => {
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
      async () => {
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
      async (options) => {
        const method =
          environment.resolve(
            execUpdate);

        await method(
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
      async (pattern, options) => {
        const method =
          environment.resolve(
            execCheck);

        await method(
          environment,
          { pattern,
            checkDefinitions:
              splitCommaSeparatedOption(
                options.checkDefinitions),
            checkRules:
              splitCommaSeparatedOption(
                options.checkRules),
            withPositives:
              options.withPositives === true });
      });

  cli.command('version')
    .description(
      'Print the current package version')
    .action(
      async () => {
        const method =
          environment.resolve(
            execVersion);

        await method(
          environment);
      });

  return cli;
}

/**
 * @param {Environment} environment
 * @param {any} error
 * @param {import('commander').Command} cli
 * @returns {boolean}
 */
function writeCommanderError(
  environment,
  error,
  cli)
{
  if (!(error instanceof Error))
  {
    return false;
  }

  const code =
    (/** @type {any} */ (error)).code;

  if (typeof code !== 'string')
  {
    return false;
  }

  if (code === 'commander.optionMissingArgument') {
    const optionName =
      extractOptionName(
        error.message);

    environment.stderr.write(
      `Option ${optionName} requires a value.\n`);

    return true;
  }

  if (code === 'commander.unknownOption') {
    const optionName =
      extractOptionName(
        error.message);

    environment.stderr.write(
      `Unknown option: ${optionName}\n`);

    return true;
  }

  if (code === 'commander.unknownCommand') {
    environment.stderr.write(
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

/**
 * @param {string} message 
 * @returns {string}
 */
function extractOptionName(
  message)
{
  const match =
    /'(--[^ <']+)/.exec(message);

  return match?.[1]
         ?? '--unknown';
}

/**
 * @param {any} value 
 * @returns {string[]}
 */
function splitCommaSeparatedOption(
  value)
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

/**
 * @param {any} value 
 * @returns {string}
 */
function filterStringOption(
  value)
{
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}