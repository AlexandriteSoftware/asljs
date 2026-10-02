/**
 * Repository CLI toolkit for package release and maintenance tasks.
 *
 * It resolves workspace packages from the repo root, reads package metadata,
 * and dispatches named actions that run git, npm, and filesystem operations.
 *
 * For broader project and release workflow details, see README.md and
 * HOWTO.md in the repository root, and skills/release.md.
 */

import { type Logger }
  from 'asljs-logging';
import { Command,
         CommanderError }
  from 'commander';
import console
  from 'node:console';
import process
  from 'node:process';
import { pathToFileURL }
  from 'node:url';
import { clean }
  from './commands/clean.js';
import { ensureCleanWorkingDirectory }
  from './commands/ensure-clean-working-directory.js';
import { fint }
  from './commands/fint.js';
import { printFile }
  from './commands/print-file.js';
import { releasePatch }
  from './commands/release-patch.js';
import { removeLocalModules }
  from './commands/remove-local-modules.js';
import { runAll }
  from './commands/run-all.js';
import { tagReleaseRevision }
  from './commands/tag-release-revision.js';
import { type CommandDoc,
         getCommandDocs }
  from './lib/actions.js';
import { createLoggerProvider,
         readLoggerOptions,
         stripLoggerOptions }
  from './lib/logger.js';

type Action =
  (
    logger: Logger,
    args?: string[]
  ) =>
    Promise<void>;

/**
 * The actions, by the key their section in `docs/toolkit.md` carries.
 *
 * The summary in that document becomes the one-line description commander
 * prints, and the rest of the section becomes the long help, so the text lives
 * in one place and only the one-liner is duplicated into the listing.
 */
const ACTIONS: ReadonlyArray<[string, Action]> =
  [ [ 'clean',
      clean ],
    [ 'ensure-clean-working-directory',
      ensureCleanWorkingDirectory ],
    [ 'tag-release-revision',
      tagReleaseRevision ],
    [ 'print-file',
      printFile ],
    [ 'release-patch',
      releasePatch ],
    [ 'run-all',
      runAll ],
    [ 'fint',
      fint ],
    [ 'remove-local-modules',
      removeLocalModules ] ];

/** The section of `docs/toolkit.md` for an action, by its first word. */
export function findCommandDoc(
    commandDocs: readonly CommandDoc[],
    name: string
  ): CommandDoc | undefined
{
  return commandDocs.find(
    commandDoc =>
      commandDoc.actionKey.split(' ')[0]
        === name);
}

export function buildProgram(
    commandDocs: readonly CommandDoc[],
    logger: Logger
  ): Command
{
  const program =
    new Command()
    .name('toolkit')
    .description(
      'Repository tasks for the asljs workspace.')
    .option(
      '--loglevel <level>',
      'logging level, for example trace, debug, information')
    .option(
      '--logfile <path>',
      'file to write logs to')
    .enablePositionalOptions()
    .showHelpAfterError();

  for (const [name, action] of ACTIONS) {
    const commandDoc =
      findCommandDoc(
        commandDocs,
        name);

    const command =
      program
      .command(name)
      .description(
        commandDoc?.actionSummary
          ?? name)
      .argument(
        '[args...]',
        'arguments for the action')
      // Declared on the subcommand as well as the program so that they are
      // consumed wherever they appear, rather than reaching the action as
      // arguments it does not know.
      .option(
        '--loglevel <level>',
        'logging level, for example trace, debug, information')
      .option(
        '--logfile <path>',
        'file to write logs to')
      .passThroughOptions()
      .allowUnknownOption()
      .action(
        async (
          args: string[]
        ): Promise<void> =>
          await action(
            logger,
            stripLoggerOptions(args)));

    if (commandDoc) {
      command.addHelpText(
        'after',
        `\n${commandDoc.helpText}`);
    }
  }

  return program;
}

export async function main(
    args: string[]
  ): Promise<void>
{
  const loggerProvider =
    createLoggerProvider(
      readLoggerOptions(args));

  try {
    const program =
      buildProgram(
        await getCommandDocs(),
        loggerProvider.getLogger('toolkit'));

    await program.parseAsync(
      args,
      { from: 'user' });
  } catch (error) {
    // Commander has already reported a usage error and says so by its type,
    // so it must not be reported a second time as a failure.
    if (error instanceof CommanderError) {
      process.exitCode = error.exitCode;

      return;
    }

    throw error;
  } finally {
    await loggerProvider.dispose();
  }
}

// checks that the script is being run directly, not imported
if (process.argv[1]) {
  const programArg = process.argv[1];

  const processArgvPath =
    pathToFileURL(programArg).href;

  if (import.meta.url === processArgvPath) {
    try {
      const args =
        process.argv.slice(2);

      await main(args);
    } catch (error) {
      const message =
        error instanceof Error
        ? error.message
        : String(error);

      console.error(message);

      process.exit(1);
    }
  }
}
