import { type Context }
  from '../context.js';
import { type CopilotRequest,
         type CopilotResponse,
         type CopilotService }
  from '../copilot.js';
import { type Task }
  from '../task.js';

export class CopilotTask implements Task<CopilotResponse>
{
  constructor(
    readonly request: CopilotRequest
  )
  {
  }

  async run(
    context: Context
  ): Promise<CopilotResponse>
  {
    context.logger.debug(
      'copilot: starting');

    context.logger.trace(
      'copilot: prompt:\n%s',
      this.request.prompt);

    const copilot =
      await context.getService<CopilotService>(
      'copilot'
    );

    const response =
      await copilot.complete(
        this.request);

    context.logger.trace(
      'copilot: response:\n%s',
      response.content);

    context.logger.debug(
      'copilot: done');

    return response;
  }
}
