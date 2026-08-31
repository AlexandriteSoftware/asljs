import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { envelopeData,
         type EnvelopeTool }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';

export interface EnvelopeTaskTaskParameters
{
  task: string;
}

export class EnvelopeTaskTask implements Task
{
  constructor(
    readonly parameters: EnvelopeTaskTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'envelope-task: starting');

    context.getTool<EnvelopeTool>(
      'envelope'
    )
      .setTask(
        context.requireData<Envelope>(
          envelopeData),
        this.parameters.task);

    context.logger.debug(
      'envelope-task: done');
  }
}
