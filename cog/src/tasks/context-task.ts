import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';

export interface ContextTaskTaskParameters
{
  task: string;
}

export class ContextTaskTask implements Task
{
  constructor(
    readonly parameters: ContextTaskTaskParameters
  )
  {
  }

  async run(
    context: Context
  ): Promise<void>
  {
    context.logger.debug(
      'context-task: starting');

    context.task =
      this.parameters.task;

    context.logger.debug(
      'context-task: done');
  }
}
