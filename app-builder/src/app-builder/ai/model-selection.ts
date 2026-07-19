import { ChatMessage }
  from '../types.js';

export type AvailableAiModel = { id: string; created?: number; };

const MODEL_EXCLUDE_PATTERN =
  /(audio|realtime|image|tts|transcribe|search|moderation|embedding|whisper)/i;

const IMPLEMENTATION_PROMPT_PATTERN =
  /\b(add|build|change|create|debug|delete|fix|implement|refactor|remove|rename|repair|replace|update|wire)\b/i;

const AFFIRMATIVE_REPLY_PATTERN =
  /^(yes|yep|yeah|ok|okay|sure|please do|go ahead|build it|do it)\b/i;

export const DEFAULT_CHAT_MODEL = 'gpt-5-mini';
export const DEFAULT_CODE_MODEL = 'gpt-5.4';

export function dedupeModels(
    models: AvailableAiModel[]
  ): AvailableAiModel[]
{
  const seen =
    new Set<string>();

  const normalized: AvailableAiModel[] = [];

  for (const model of models) {
    const id =
      typeof model.id === 'string'
      ? model.id.trim()
      : '';

    if (
      id === '' || seen.has(
        id.toLowerCase()
      )
    ) {
      continue;
    }

    seen.add(
      id.toLowerCase()
    );

    normalized.push(
      {
        id,
        created: Number.isFinite(
          model.created)
          ? model.created
          : 0
      }
    );
  }

  return normalized;
}

export function shouldUseCodeGenerationModel(
    prompt: string,
    messages: ChatMessage[]
  ): boolean
{
  const normalizedPrompt =
    prompt.trim();

  if (normalizedPrompt === '') {
    return false;
  }

  if (
    IMPLEMENTATION_PROMPT_PATTERN.test(
      normalizedPrompt
    )
  ) {
    return true;
  }

  const lastAssistantMessage =
    [...messages]
    .reverse()
    .find(
      message => message.role === 'assistant'
    )
    ?.text
    ?? '';

  return /Shall I build these changes\?/i.test(
    lastAssistantMessage
  )
    && AFFIRMATIVE_REPLY_PATTERN.test(
      normalizedPrompt
    );
}

export function selectPreferredChatModel(
    models: AvailableAiModel[]
  ): string
{
  const generalModels =
    filterGeneralPurposeModels(models)
    .sort(
      compareChatModels
    );

  return generalModels[0]?.id ?? DEFAULT_CHAT_MODEL;
}

export function selectPreferredCodeModel(
    models: AvailableAiModel[]
  ): string
{
  const codexModels =
    filterCodexModels(models)
    .sort(
      compareLatestModels
    );

  if (codexModels.length > 0) {
    return codexModels[0].id;
  }

  const generalModels =
    filterGeneralPurposeModels(models)
    .sort(
      compareLatestModels
    );

  return generalModels[0]?.id ?? DEFAULT_CODE_MODEL;
}

function filterCodexModels(
    models: AvailableAiModel[]
  ): AvailableAiModel[]
{
  return dedupeModels(models)
    .filter(
      model =>
        isSupportedChatModel(
          model.id
        ) && /codex/i.test(
          model.id
        )
    );
}

function filterGeneralPurposeModels(
    models: AvailableAiModel[]
  ): AvailableAiModel[]
{
  return dedupeModels(models)
    .filter(
      model =>
        isSupportedChatModel(
          model.id
        ) && !/codex/i.test(
          model.id
        )
    );
}

function isSupportedChatModel(
    modelId: string
  ): boolean
{
  const normalized =
    modelId.trim().toLowerCase();

  return normalized.startsWith('gpt-')
    && !MODEL_EXCLUDE_PATTERN.test(normalized);
}

function compareChatModels(
    left: AvailableAiModel,
    right: AvailableAiModel
  ): number
{
  const tierDelta =
    compareVariantPriority(
      left.id,
      right.id,
      getChatVariantPriority);

  if (tierDelta !== 0) {
    return tierDelta;
  }

  return compareLatestModels(
    left,
    right
  );
}

function compareLatestModels(
    left: AvailableAiModel,
    right: AvailableAiModel
  ): number
{
  const versionDelta =
    compareNumericTokens(
      right.id,
      left.id);

  if (versionDelta !== 0) {
    return versionDelta;
  }

  const createdDelta =
    (right.created ?? 0) - (left.created ?? 0);

  if (createdDelta !== 0) {
    return createdDelta;
  }

  return compareVariantPriority(
    left.id,
    right.id,
    getLatestVariantPriority
  );
}

function compareVariantPriority(
    leftId: string,
    rightId: string,
    getPriority: (modelId: string) => number
  ): number
{
  return getPriority(leftId) - getPriority(rightId);
}

function getChatVariantPriority(
    modelId: string
  ): number
{
  const normalized =
    modelId.toLowerCase();

  if (normalized.includes('mini')) {
    return 0;
  }

  if (normalized.includes('nano')) {
    return 1;
  }

  return 2;
}

function getLatestVariantPriority(
    modelId: string
  ): number
{
  const normalized =
    modelId.toLowerCase();

  if (normalized.includes('nano')) {
    return 2;
  }

  if (normalized.includes('mini')) {
    return 1;
  }

  return 0;
}

function compareNumericTokens(
    leftId: string,
    rightId: string
  ): number
{
  const left =
    extractNumericTokens(leftId);

  const right =
    extractNumericTokens(rightId);

  const length =
    Math.max(
      left.length,
      right.length);

  for (let index = 0; index < length; index += 1) {
    const delta =
      (left[index] ?? -1) - (right[index] ?? -1);

    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
}

function extractNumericTokens(
    modelId: string
  ): number[]
{
  return Array.from(
    modelId.matchAll(/\d+/g),
    match =>
      Number.parseInt(
        match[0],
        10
      )
  );
}
