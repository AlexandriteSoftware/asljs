import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';

export interface ContextWriteFileTaskParameters
{
  path: string;
  content: string;
}

export class ContextWriteFileTask implements Task
{
  constructor(
    readonly parameters: ContextWriteFileTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-write-file: starting, path %s',
      this.parameters.path);

    await fs.mkdir(
      path.dirname(
        this.parameters.path),
      { recursive: true });

    await fs.writeFile(
      this.parameters.path,
      this.parameters.content,
      'utf-8');

    context.logger.debug(
      'context-write-file: done');
  }
}
