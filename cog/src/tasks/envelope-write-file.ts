import { type Write }
  from '../commands/write.js';
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

export class EnvelopeWriteFileTask implements Task
{
  constructor(
    readonly parameters: Write
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'envelope-write-file: starting, path %s',
      this.parameters.path);

    await context.getTool<EnvelopeTool>(
      'envelope'
    )
      .writeFile(
        context.requireData<Envelope>(
          envelopeData
        ),
        this.parameters,
        context.getData<RollbackFeed>(
          rollbackFeedData
        ));

    context.logger.debug(
      'envelope-write-file: done');
  }
}
