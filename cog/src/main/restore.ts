import { Command }
  from 'commander';
import { resolveBackupPath }
  from './backup.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

export function configureRestoreCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'restore')
    .description(
      'restore files from backup.json')
    .action(
      async () =>
      {
        const options =
          program.opts<{
          envelope?: string;
        }>();

        await restoreCmd(
          context,
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });
}

async function restoreCmd(
    context: ExecutionContext,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const backupPath =
    resolveBackupPath(
      envelopePath);

  await context.automation.run(
    context.automation.createTask(
      'restore',
      { backupPath }));
}
