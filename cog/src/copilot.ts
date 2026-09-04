import { type ContextFile }
  from './context.js';
import { type Service }
  from './service.js';
import { type CopilotAcpTool }
  from './tools/copilot.js';

export interface CopilotRequest
{
  prompt: string;
  files?: ContextFile[];
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
                 buildPrompt(
                   request)) };
  }

  async dispose(): Promise<void>
  {
    if (this.#started) {
      this.#started = false;

      await this.tool.stop();
    }
  }
}

function buildPrompt(
    request: CopilotRequest
  ): string
{
  const sections =
    request.files?.map(
      formatFile)
    ?? [ ];

  if (request.prompt.trim().length > 0) {
    sections.unshift(
      request.prompt);
  }

  return sections.join(
    '\n\n');
}

function formatFile(
    file: ContextFile
  ): string
{
  const label =
    file.complete === false
    ? `File: ${file.path} (partial)`
    : `File: ${file.path}`;

  const body =
    file.type === 'text'
    ? file.content ?? ''
    : '(binary content omitted)';

  return [ label,
           '```',
           body,
           '```' ].join(
             '\n');
}
