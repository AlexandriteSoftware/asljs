import {
    type AiTools,
    type ResponseFunctionCall,
    type ResponseFunctionCallOutput,
    OPENAI_TOOLS,
    executeToolCall,
    isResponseFunctionCall,
    readCallId,
    readFunctionName
  } from './ai-tools.js';

const OPENAI_RESPONSES_URL =
  'https://api.openai.com/v1/responses';

export type AiModel = 'gpt-5.3-codex' | 'gpt-5.4';

export const DEFAULT_MODEL: AiModel = 'gpt-5.3-codex';
export const DEFAULT_MAX_TOOL_STEPS = 20;
export const DEFAULT_SYSTEM_PROMPT = 'You are an expert ASLJS app generator.';

const TOOL_STEP_EXTENSION = 12;

type AgentRunResult =
  { summary: string; };

type ToolStepLimitInfo =
  { stepsCompleted: number;
    stepLimit: number; };

type GenerateAppOptions =
  { initialToolStepLimit?: number;
    onToolStepLimit?: (info: ToolStepLimitInfo) => Promise<boolean>;
    onProgress?: (message: string) => void | Promise<void>;
    systemPrompt?: string;
    transport?: AiResponsesTransport; };

type ResponsesOutputMessage =
  { type: 'message';
    role?: 'assistant';
    content?:
      Array<{ type?: 'output_text';
              text?: string; }>; };

type ResponsesResult =
  { id?: string;
    output_text?: string;
    output?:
      Array<ResponseFunctionCall
            | ResponsesOutputMessage
            | Record<string, unknown>>; };

type TransportRequest =
  { apiKey: string;
    model: AiModel;
    instructions: string;
    temperature: number;
    previous_response_id?: string;
    input: string | ResponseFunctionCallOutput[];
    tools: typeof OPENAI_TOOLS; };

export type AiResponsesTransport =
  { createResponse: (
        request: TransportRequest,
      ) => Promise<ResponsesResult>; };

const DEFAULT_TRANSPORT: AiResponsesTransport =
  { createResponse: async request => {
      const response = await fetch(
        OPENAI_RESPONSES_URL,
        { method: 'POST',
          headers:
            { 'Content-Type': 'application/json',
              Authorization: `Bearer ${request.apiKey}` },
          body:
            JSON.stringify({
              model: request.model,
              instructions: request.instructions,
              temperature: request.temperature,
              previous_response_id: request.previous_response_id,
              input: request.input,
              tools: request.tools,
            }) });

      if (!response.ok) {
        const errorPayload =
          await response.json()
            .catch(() => ({} as Record<string, unknown>));

        const message =
          getOpenAiErrorMessage(errorPayload)
          ?? `OpenAI API error: ${response.status}`;

        throw new Error(message);
      }

      return response.json() as Promise<ResponsesResult>;
    } };

export async function generateApp(
    prompt: string,
    apiKey: string,
    model: AiModel,
    tools: AiTools,
    options?: GenerateAppOptions,
  ): Promise<AgentRunResult>
{
  const transport = options?.transport ?? DEFAULT_TRANSPORT;
  const systemPrompt = options?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
  let previousResponseId: string | undefined;
  let input: string | ResponseFunctionCallOutput[] = prompt;
  let stepLimit = normalizeInitialStepLimit(options?.initialToolStepLimit);
  let step = 0;

  while (true) {
    await reportProgress(
      options,
      `Step ${step + 1}: requesting assistant response...`);

    if (step >= stepLimit) {
      const shouldContinue =
        await options?.onToolStepLimit?.({
          stepsCompleted: step,
          stepLimit })
        ?? false;

      if (!shouldContinue) {
        throw new Error(
          'AI exceeded maximum tool steps without completing.');
      }

      stepLimit += TOOL_STEP_EXTENSION;
      await reportProgress(
        options,
        `Extended step limit to ${stepLimit}. Continuing...`);
    }

    const data = await transport.createResponse({
      apiKey,
      model,
      instructions: systemPrompt,
      temperature: 0.1,
      previous_response_id: previousResponseId,
      input,
      tools: OPENAI_TOOLS,
    });

    if (!Array.isArray(data.output)) {
      throw new Error(
        'AI returned an unexpected response format.');
    }

    const toolCalls =
      data.output.filter(isResponseFunctionCall);

    if (toolCalls.length === 0) {
      await reportProgress(
        options,
        `Completed in ${step + 1} step(s). Finalizing summary...`);

      const summary =
        extractResponsesSummary(data);

      return {
        summary: summary === ''
          ? 'Completed tool-based update.'
          : summary,
      };
    }

    const toolOutputs: ResponseFunctionCallOutput[] = [];
    for (const toolCall of toolCalls) {
      await reportProgress(
        options,
        `Step ${step + 1}: running ${readFunctionName(toolCall)}...`);

      const output = await executeToolCall(toolCall, tools);
      toolOutputs.push({
        type: 'function_call_output',
        call_id: readCallId(toolCall),
        output,
      });
    }

    await reportProgress(
      options,
      `Step ${step + 1}: submitted ${toolOutputs.length} tool result(s).`);

    previousResponseId =
      typeof data.id === 'string'
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
  if (!Number.isFinite(value))
    return DEFAULT_MAX_TOOL_STEPS;

  const candidate =
    Math.floor(value as number);

  return candidate >= 1
    ? candidate
    : DEFAULT_MAX_TOOL_STEPS;
}

async function reportProgress(
    options: GenerateAppOptions | undefined,
    message: string,
  ): Promise<void>
{
  if (options?.onProgress === undefined)
    return;

  await Promise.resolve(options.onProgress(message));
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

function extractResponsesSummary(data: ResponsesResult): string {
  if (typeof data.output_text === 'string' && data.output_text.trim() !== '') {
    return data.output_text.trim();
  }

  if (!Array.isArray(data.output)) {
    return '';
  }

  const parts = data.output
    .filter((item): item is ResponsesOutputMessage => item.type === 'message')
    .flatMap(item => item.content ?? [])
    .map(item => item.text ?? '')
    .map(text => text.trim())
    .filter(text => text !== '');

  return parts.join('\n');
}

