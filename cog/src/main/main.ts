import { Command }
  from 'commander';
import { DefaultHostConsole }
  from '../console.js';
import { createLogger }
  from '../logger.js';
import { configureApplyPatchCommand }
  from './apply-patch.js';
import { configureListCommand }
  from './list.js';
import { configureReadCommand }
  from './read.js';
import { configureRestoreCommand }
  from './restore.js';
import { configureUpdateCommand }
  from './update.js';
import { type ExecutionContext }
  from './types.js';

export async function main(
    argv = process.argv
  ): Promise<void>
{
  const logger =
    createLogger();

  const context: ExecutionContext =
    { logger,
      console:
        new DefaultHostConsole(),
      dispose:
        () => logger.dispose() };

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

    program
      .action(
        () => {
          throw new Error(
            'Usage: cog <read|list|update|restore|apply-patch> [args...]');
        });

    await program.parseAsync(
      argv);
  } finally {
    context.dispose?.();
  }
}
