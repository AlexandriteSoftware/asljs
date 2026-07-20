import { Command }
  from 'commander';
import { existsSync }
  from 'node:fs';
import { BackupRollbackFeed }
  from '../model/rollback.js';
import { resolveBackupPath }
  from './backup.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

export function configureRestoreCommand(
    program: Command,
    _context: ExecutionContext
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
          {
            envelopePath: resolveEnvelopePath(
              options.envelope)
          });
      });
}

async function restoreCmd(
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const backupPath =
    resolveBackupPath(
      envelopePath);

  if (
    !existsSync(
      backupPath)
  ) {
    throw new Error(
      `backup.json does not exist: ${backupPath}`
    );
  }

  await BackupRollbackFeed.restoreAndDelete(
    backupPath);
}
