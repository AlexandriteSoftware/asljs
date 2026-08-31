import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { type CopilotAcpTool }
  from '../tools/copilot.js';

export interface CopilotCheckTaskParameters
{
  prompts?: string[];
}

export interface CopilotCheckResult
{
  sessionId?: string;
  responses: string[];
}

const defaultPrompts =
  [ 'Reply with exactly: PING',
    'Reply with exactly: PONG' ];

export class CopilotCheckTask implements Task<CopilotCheckResult>
{
  constructor(
    readonly parameters: CopilotCheckTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<CopilotCheckResult>
  {
    const copilot =
      context.getTool<CopilotAcpTool>(
      'copilot'
    );

    const prompts =
      this.parameters.prompts
      ?? defaultPrompts;

    const responses: string[] = [ ];

    context.logger.debug(
      'copilot-check: starting');

    context.logger.debug(
      'copilot-check: starting server');

    await copilot.start();

    const sessionId = copilot.sessionId;

    try {
      for (const prompt of prompts) {
        context.logger.debug(
          'copilot-check: sending %s',
          prompt);

        context.logger.trace(
          'copilot-check: prompt:\n%s',
          prompt);

        const response =
          await copilot.prompt(
            prompt);

        context.logger.trace(
          'copilot-check: response:\n%s',
          response);

        if (response.trim() === '') {
          throw new Error(
            `Copilot returned an empty response for prompt: ${prompt}`);
        }

        responses.push(
          response);
      }
    } finally {
      await copilot.stop();

      context.logger.debug(
        'copilot-check: stopped server');
    }

    context.logger.debug(
      'copilot-check: done');

    return { sessionId,
             responses };
  }
}
