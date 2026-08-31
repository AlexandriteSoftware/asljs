import { type Service }
  from './service.js';
import { type CopilotAcpTool }
  from './tools/copilot.js';

export interface CopilotRequest
{
  prompt: string;
}

export interface CopilotResponse
{
  content: string;
}

export interface CopilotService extends Service
{
  complete(
    request: CopilotRequest
  ): Promise<CopilotResponse>;
}

/** Adapts the ACP tool to CopilotService, starting the server on first use. */
export class CopilotAcpService implements CopilotService
{
  #started = false;

  constructor(
    readonly tool: CopilotAcpTool
  )
  {
  }

  async complete(
    request: CopilotRequest
  ): Promise<CopilotResponse>
  {
    if (!this.#started) {
      await this.tool.start();

      this.#started = true;
    }

    return { content:
               await this.tool.prompt(
                 request.prompt) };
  }

  async dispose(): Promise<void>
  {
    if (this.#started) {
      this.#started = false;

      await this.tool.stop();
    }
  }
}
