import { type ReadParameters }
  from '../commands/read.js';
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

export class EnvelopeAddFilesTask implements Task
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
      'envelope-add-files: starting, pattern %o',
      this.parameters.pattern);

    await context.getTool<EnvelopeTool>(
      'envelope'
    )
      .addFiles(
        context.requireData<Envelope>(
          envelopeData
        ),
        this.parameters,
        context.getData<RollbackFeed>(
          rollbackFeedData
        ));

    context.logger.debug(
      'envelope-add-files: done');
  }
}
