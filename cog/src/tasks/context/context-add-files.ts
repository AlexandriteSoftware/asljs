import { type Context }
  from '../../context.js';
import { type Task }
  from '../../task.js';
import { type ReadParameters }
  from './read.js';
import { read }
  from './read.js';

export class ContextAddFilesTask implements Task
{
  constructor(
    readonly parameters: ReadParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-add-files: starting, pattern %o',
      this.parameters.pattern);

    await read(
      context.files,
      this.parameters);

    context.logger.debug(
      'context-add-files: done');
  }
}
