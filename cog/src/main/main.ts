import { Command }
  from 'commander';
import { readFileSync }
  from 'node:fs';
import { DefaultHostConsole }
  from '../console.js';
import { createLoggerProvider }
  from '../logger.js';
import { configureApplyPatchCommand }
  from './apply-patch.js';
import { configureConfigCommand }
  from './config.js';
import { configureListCommand }
  from './list.js';
import { configureReadCommand }
  from './read.js';
import { configureRestoreCommand }
  from './restore.js';
import { ExecutionContext }
  from './types.js';
import { configureUpdateCommand }
  from './update.js';

type PackageMetadata = {
  version: string;
};

const packageMetadata: PackageMetadata =
  JSON.parse(
    readFileSync(
      new URL(
        '../../package.json',
        import.meta.url),
      'utf8')) as PackageMetadata;

export async function main(
    argv = process.argv
  ): Promise<void>
{
  const loggerProvider =
    createLoggerProvider();

  const logger =
    loggerProvider.getLogger(
      'cog.main');

  const context: ExecutionContext =
    { loggerProvider,
      logger,
      console:
        new DefaultHostConsole() };

  try {
    const program =
      new Command();

    program
      .name(
        'cog')
      .allowExcessArguments(
        false)
      .exitOverride()
      .option(
        '--envelope <path>',
        'path to the envelope JSON file')
      .option(
        '--patch <path>',
        'path to the patch JSON file')
      .showHelpAfterError();

    configureReadCommand(
      program,
      context);

    configureListCommand(
      program,
      context);

    configureUpdateCommand(
      program,
      context);

    configureRestoreCommand(
      program,
      context);

    configureApplyPatchCommand(
      program,
      context);

    configureConfigCommand(
      program,
      context);

    program
      .command(
        'version')
      .description(
        'print application version')
      .action(
        () =>
        {
          context.console.writeLine(
            packageMetadata.version);
        });

    program
      .action(
        () =>
        {
          throw new Error(
            'Usage: cog <read|list|update|restore|apply-patch|config|version> [args...]');
        });

    await program.parseAsync(
      argv);
  } finally {
    await loggerProvider.dispose();
  }
}
