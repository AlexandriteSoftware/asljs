import { existsSync }
  from 'node:fs';
import { type Context }
  from '../context.js';
import { BackupRollbackFeed }
  from '../model/rollback.js';
import { type Task }
  from '../task.js';

export interface RestoreTaskParameters
{
  backupPath: string;
}

export class RestoreTask implements Task
{
  constructor(
    readonly parameters: RestoreTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'restore: starting, backup %s',
      this.parameters.backupPath);

    if (
      !existsSync(
        this.parameters.backupPath)
    ) {
      throw new Error(
        `backup.json does not exist: ${this.parameters.backupPath}`);
    }

    await BackupRollbackFeed.restoreAndDelete(
      this.parameters.backupPath);

    context.logger.debug(
      'restore: done');
  }
}
