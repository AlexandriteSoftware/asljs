import { Command }
  from 'commander';
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

export async function main(
    argv = process.argv
  ): Promise<void>
{
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
    program);

  configureListCommand(
    program);

  configureUpdateCommand(
    program);

  configureRestoreCommand(
    program);

  configureApplyPatchCommand(
    program);

  program
    .action(
      () => {
        throw new Error(
          'Usage: cog <read|list|update|restore|apply-patch> [args...]');
      });

  await program.parseAsync(
    argv);
}
