import { type Remove }
  from '../commands/remove.js';
import { type Context }
  from '../context.js';
import { type RollbackFeed }
  from '../model/rollback.js';
import { type Task }
  from '../task.js';
import { envelopeData,
         type EnvelopeTool,
         rollbackFeedData }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';

export class EnvelopeRemoveFileTask implements Task
{
  constructor(
    readonly parameters: Remove
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'envelope-remove-file: starting, path %s',
      this.parameters.path);

    await context.getTool<EnvelopeTool>(
      'envelope'
    )
      .removeFile(
        context.requireData<Envelope>(
          envelopeData
        ),
        this.parameters,
        context.getData<RollbackFeed>(
          rollbackFeedData
        ));

    context.logger.debug(
      'envelope-remove-file: done');
  }
}
