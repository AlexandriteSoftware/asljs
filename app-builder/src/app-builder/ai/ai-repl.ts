import { AiTools,
         executeToolCall,
         isResponseFunctionCall,
         OPENAI_TOOLS,
         readCallId,
         readFunctionName,
         ResponseFunctionCall,
         ResponseFunctionCallOutput }
  from './ai-tools.js';

const OPENAI_RESPONSES_URL =
  'https://api.openai.com/v1/responses';

export type AiModel = string;
export type AvailableModelResult = { id: string; created?: number; };

export const DEFAULT_MODEL: AiModel =
  'gpt-5.3-codex';

export const DEFAULT_MAX_TOOL_STEPS = 20;

export const DEFAULT_SYSTEM_PROMPT =
  'You are an expert ASLJS app generator.';

export const TOOL_STEP_LIMIT_EXCEEDED_MESSAGE =
  'AI exceeded maximum tool steps without completing.';

export const GENERATION_STOPPED_MESSAGE =
  'Generation stopped by the user.';

const TOOL_STEP_EXTENSION = 12;

export class ToolStepLimitExceededError extends Error
{
  readonly stepsCompleted: number;
  readonly stepLimit: number;

  constructor(info: ToolStepLimitInfo)
  {
    super(
      TOOL_STEP_LIMIT_EXCEEDED_MESSAGE
    );

    this.name = 'ToolStepLimitExceededError';
    this.stepsCompleted = info.stepsCompleted;
    this.stepLimit = info.stepLimit;
  }
}

export class GenerationStoppedError extends Error
{
  constructor()
  {
    super(
      GENERATION_STOPPED_MESSAGE
    );

    this.name = 'GenerationStoppedError';
  }
}

type AgentRunResult = { summary: string; };

type ToolStepLimitInfo = { stepsCompleted: number; stepLimit: number; };

type GenerateAppOptions = {
  initialToolStepLimit?: number;
  onToolStepLimit?: (info: ToolStepLimitInfo) => Promise<boolean>;
  onProgress?: (message: string) => void | Promise<void>;
  shouldStop?: () => boolean;
  systemPrompt?: string;
  transport?: AiResponsesTransport;
};

type ResponsesOutputMessage = {
  type: 'message';
  role?: 'assistant';
  content?: Array<{ type?: 'output_text'; text?: string; }>;
};

type ResponsesResult = {
  id?: string;
  output_text?: string;
  output?: Array<
    | ResponseFunctionCall
    | ResponsesOutputMessage
    | Record<string, unknown>
  >;
};

type TransportRequest = {
  apiKey: string;
  model: AiModel;
  instructions: string;
  temperature: number;
  previous_response_id?: string;
  input: string | ResponseFunctionCallOutput[];
  tools: typeof OPENAI_TOOLS;
};

export type AiResponsesTransport = {
  createResponse: (
    request: TransportRequest
  ) => Promise<ResponsesResult>;
};

export type AiModelsTransport = {
  listModels: (
    apiKey: string
  ) => Promise<AvailableModelResult[]>;
};

const DEFAULT_TRANSPORT: AiResponsesTransport =
  {
  createResponse: async request =>
  {
    const response =
      await fetch(
        OPENAI_RESPONSES_URL,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${request.apiKey}`
        },
        body: JSON.stringify(
          {
            model: request.model,
            instructions: request.instructions,
            temperature: request.temperature,
            previous_response_id: request.previous_response_id,
            input: request.input,
            tools: request.tools
          }
        )
      });

    if (!response.ok) {
      const errorPayload =
        await response.json()
        .catch(
          () => ({} as Record<string, unknown>)
        );

      const message =
        getOpenAiErrorMessage(errorPayload)
        ?? `OpenAI API error: ${response.status}`;

      throw new Error(message);
    }

    return response.json() as Promise<ResponsesResult>;
  }
};

const DEFAULT_MODELS_TRANSPORT: AiModelsTransport =
  {
  listModels: async apiKey =>
  {
    const response =
      await fetch(
        OPENAI_RESPONSES_URL.replace(
          '/responses',
          '/models'),
        {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

    if (!response.ok) {
      const errorPayload =
        await response.json()
        .catch(
          () => ({} as Record<string, unknown>)
        );

      const message =
        getOpenAiErrorMessage(errorPayload)
        ?? `OpenAI API error: ${response.status}`;

      throw new Error(message);
    }

    const payload =
      await response.json() as { data?: unknown; };

    if (
      !Array.isArray(
        payload.data
      )
    ) {
      throw new Error('OpenAI returned an unexpected model list format.');
    }

    return payload.data
      .filter(
        (value): value is { id?: unknown; created?: unknown; } =>
          typeof value === 'object' && value !== null
      )
      .map(
        value => ({
          id: typeof value.id === 'string'
            ? value.id
            : '',
          created: typeof value.created === 'number'
            ? value.created
            : 0
        })
      )
      .filter(
        value => value.id !== ''
      );
  }
};

export async function listAvailableModels(
    apiKey: string,
    transport: AiModelsTransport = DEFAULT_MODELS_TRANSPORT
  ): Promise<AvailableModelResult[]>
{
  if (apiKey.trim() === '') {
    return [];
  }

  return transport.listModels(apiKey);
}

export async function generateApp(
    prompt: string,
    apiKey: string,
    model: AiModel,
    tools: AiTools,
    options?: GenerateAppOptions
  ): Promise<AgentRunResult>
{
  const transport =
    options?.transport ?? DEFAULT_TRANSPORT;

  const systemPrompt =
    options?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  let previousResponseId: string | undefined;
  let input: string | ResponseFunctionCallOutput[] = prompt;

  let stepLimit =
    normalizeInitialStepLimit(
      options?.initialToolStepLimit);

  let step = 0;

  while (true) {
    if (options?.shouldStop?.() === true) {
      throw new GenerationStoppedError();
    }

    await reportProgress(
      options,
      `Step ${step + 1}: requesting assistant response...`
    );

    if (step >= stepLimit) {
      const shouldContinue =
        await options?.onToolStepLimit(
          {
          stepsCompleted: step,
          stepLimit
        })
        ?? false;

      if (!shouldContinue) {
        throw new ToolStepLimitExceededError({
          stepsCompleted: step,
          stepLimit
        });
      }

      stepLimit += TOOL_STEP_EXTENSION;

      await reportProgress(
        options,
        `Extended step limit to ${stepLimit}. Continuing...`
      );
    }

    const data =
      await transport.createResponse(
        {
        apiKey,
        model,
        instructions: systemPrompt,
        temperature: 0.1,
        previous_response_id: previousResponseId,
        input,
        tools: OPENAI_TOOLS
      });

    if (
      !Array.isArray(
        data.output
      )
    ) {
      throw new Error(
        'AI returned an unexpected response format.'
      );
    }

    const toolCalls =
      data.output.filter(
        isResponseFunctionCall);

    if (toolCalls.length === 0) {
      await reportProgress(
        options,
        `Completed in ${step + 1} step(s). Finalizing summary...`
      );

      const summary =
        extractResponsesSummary(data);

      return {
        summary: summary === ''
          ? 'Completed tool-based update.'
          : summary
      };
    }

    const toolOutputs: ResponseFunctionCallOutput[] = [];

    for (const toolCall of toolCalls) {
      if (options?.shouldStop?.() === true) {
        throw new GenerationStoppedError();
      }

      await reportProgress(
        options,
        `Step ${step + 1}: running ${readFunctionName(toolCall)}...`
      );

      const output =
        await executeToolCall(
          toolCall,
          tools);

      toolOutputs.push(
        {
          type: 'function_call_output',
          call_id: readCallId(toolCall),
          output
        }
      );
    }

    await reportProgress(
      options,
      `Step ${step + 1}: submitted ${toolOutputs.length} tool result(s).`
    );

    previousResponseId = typeof data.id === 'string'
      ? data.id
      : previousResponseId;

    input = toolOutputs;
    step += 1;
  }
}

function normalizeInitialStepLimit(
    value: number | undefined
  ): number
{
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_TOOL_STEPS;
  }

  const candidate =
    Math.floor(
      value as number);

  return candidate >= 1
    ? candidate
    : DEFAULT_MAX_TOOL_STEPS;
}

async function reportProgress(
    options: GenerateAppOptions | undefined,
    message: string
  ): Promise<void>
{
  if (options?.onProgress === undefined) {
    return;
  }

  await Promise.resolve(
    options.onProgress(message)
  );
}

function getOpenAiErrorMessage(
    payload: Record<string, unknown>
  ): string | null
{
  const error =
    payload.error as { message?: unknown; } | undefined;

  return typeof error?.message === 'string'
    ? error.message
    : null;
}

function extractResponsesSummary(
    data: ResponsesResult
  ): string
{
  if (typeof data.output_text === 'string' && data.output_text.trim() !== '') {
    return data.output_text.trim();
  }

  if (
    !Array.isArray(
      data.output
    )
  ) {
    return '';
  }

  const parts =
    data.output
    .filter(
      (item): item is ResponsesOutputMessage => item.type === 'message'
    )
    .flatMap(
      item => item.content ?? []
    )
    .map(
      item => item.text ?? ''
    )
    .map(
      text => text.trim()
    )
    .filter(
      text => text !== ''
    );

  return parts.join('\n');
}
