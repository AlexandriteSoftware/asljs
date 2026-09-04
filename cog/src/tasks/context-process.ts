import { type Context }
  from '../context.js';
import { type CopilotResponse }
  from '../copilot.js';
import { type Task }
  from '../task.js';

export interface ContextProcessTaskParameters
{
}

export class ContextProcessTask implements Task<CopilotResponse>
{
  constructor(
    readonly parameters: ContextProcessTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<CopilotResponse>
  {
    context.logger.debug(
      'context-process: starting');

    const response =
      await context.run(
        context.createTask<CopilotResponse>(
        'copilot',
        { prompt:
            buildPrompt(
              context),
          files: context.files }
      ));

    context.logger.debug(
      'context-process: done');

    return response;
  }
}

function buildPrompt(
    context: Context
  ): string
{
  const sections: string[] = [ ];

  if (context.instruction.trim().length > 0) {
    sections.push(
      'Instruction:',
      context.instruction);
  }

  if (
    context.task
    && context.task.trim().length > 0
  ) {
    sections.push(
      'Task:',
      context.task);
  }

  return sections.join(
    '\n\n');
}
