import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';

export interface ContextInstructionTaskParameters
{
  instruction: string;
}

export class ContextInstructionTask implements Task
{
  constructor(
    readonly parameters: ContextInstructionTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-instruction: starting');

    context.instruction =
      this.parameters.instruction;

    context.logger.debug(
      'context-instruction: done');
  }
}
