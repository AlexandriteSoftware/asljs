import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { envelopeData,
         type EnvelopeTool }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';

export class EnvelopeUpdateFilesTask implements Task
{
  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'envelope-update-files: starting');

    const updates =
      context.getTool<EnvelopeTool>(
      'envelope'
    )
      .getUpdateParameters(
        context.requireData<Envelope>(
          envelopeData
        ));

    context.logger.trace(
      'envelope-update-files: update commands: %o',
      updates);

    for (const parameters of updates) {
      await context.run(
        context.createTask(
          'envelope-add-files',
          parameters));
    }

    context.logger.debug(
      'envelope-update-files: done');
  }
}
