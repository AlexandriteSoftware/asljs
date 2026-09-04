import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { type ReadParameters }
  from '../tools/read.js';

export class ContextUpdateFilesTask implements Task
{
  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-update-files: starting');

    const updates: ReadParameters[] =
      context.files
      .map(
        file => file.update)
      .filter(
        (parameters): parameters is ReadParameters => parameters !== undefined);

    context.logger.trace(
      'context-update-files: update commands: %o',
      updates);

    for (const parameters of updates) {
      await context.run(
        context.createTask(
          'context-add-files',
          parameters));
    }

    context.logger.debug(
      'context-update-files: done');
  }
}
