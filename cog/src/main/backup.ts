import { existsSync }
  from 'node:fs';
import { dirname,
         join }
  from 'node:path';

export function resolveBackupPath(
    envelopePath: string
  ): string
{
  return join(
    dirname(
      envelopePath),
    '.cog',
    'backup.json');
}

export function ensureBackupFileDoesNotExist(
    backupPath: string
  ): void
{
  if (existsSync(
      backupPath)) {
    throw new Error(
      `backup.json exists: run cog restore or delete ${backupPath} before applying a patch`);
  }
}
