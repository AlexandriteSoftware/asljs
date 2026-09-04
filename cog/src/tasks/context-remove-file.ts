import fs
  from 'node:fs/promises';
import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';

export interface ContextRemoveFileTaskParameters
{
  path: string;
}

export class ContextRemoveFileTask implements Task
{
  constructor(
    readonly parameters: ContextRemoveFileTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-remove-file: starting, path %s',
      this.parameters.path);

    await fs.rm(
      this.parameters.path,
      { force: true });

    const fileIndex =
      context.files
      .findIndex(
        file => file.path === this.parameters.path);

    if (fileIndex !== -1) {
      context.files.splice(
        fileIndex,
        1);
    }

    context.logger.debug(
      'context-remove-file: done');
  }
}
