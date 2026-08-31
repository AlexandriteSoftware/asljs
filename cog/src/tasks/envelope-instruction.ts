import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { envelopeData,
         type EnvelopeTool }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';

export interface EnvelopeInstructionTaskParameters
{
  instruction: string;
}

export class EnvelopeInstructionTask implements Task
{
  constructor(
    readonly parameters: EnvelopeInstructionTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'envelope-instruction: starting');

    context.getTool<EnvelopeTool>(
      'envelope'
    )
      .setInstruction(
        context.requireData<Envelope>(
          envelopeData),
        this.parameters.instruction);

    context.logger.debug(
      'envelope-instruction: done');
  }
}
