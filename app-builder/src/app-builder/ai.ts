import {
    type GenerateAppResult,
    type GeneratedFile,
  } from './types.js';

import observableReadme
  from '../../../observable/README.md?raw';
import eventfulReadme
  from '../../../eventful/README.md?raw';
import dataBindingReadme
  from '../../../data-binding/README.md?raw';
import componentsReadme
  from '../../../components/README.md?raw';
import daliReadme
  from '../../../dali/README.md?raw';

import observableIndex
  from '../../../observable/src/index.ts?raw';
import eventfulIndex
  from '../../../eventful/src/index.ts?raw';
import dataBindingIndex
  from '../../../data-binding/src/index.ts?raw';
import componentsIndex
  from '../../../components/src/index.ts?raw';
import daliIndex
  from '../../../dali/src/index.ts?raw';

import observablePackageRaw
  from '../../../observable/package.json?raw';
import eventfulPackageRaw
  from '../../../eventful/package.json?raw';
import dataBindingPackageRaw
  from '../../../data-binding/package.json?raw';
import componentsPackageRaw
  from '../../../components/package.json?raw';
import daliPackageRaw
  from '../../../dali/package.json?raw';

const OPENAI_CHAT_URL =
  'https://api.openai.com/v1/chat/completions';

const OBSERVABLE_VERSION =
  readPackageVersion(observablePackageRaw, 'asljs-observable');
const EVENTFUL_VERSION =
  readPackageVersion(eventfulPackageRaw, 'asljs-eventful');
const DATA_BINDING_VERSION =
  readPackageVersion(dataBindingPackageRaw, 'asljs-data-binding');
const COMPONENTS_VERSION =
  readPackageVersion(componentsPackageRaw, 'asljs-components');
const DALI_VERSION =
  readPackageVersion(daliPackageRaw, 'asljs-dali');

const SYSTEM_PROMPT =
  buildSystemPrompt();

export async function generateApp(
    prompt: string,
    apiKey: string
  ): Promise<GenerateAppResult>
{
  const response =
    await fetch(
      OPENAI_CHAT_URL,
      { method: 'POST',
        headers:
          { 'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(
          { model: 'gpt-4o-mini',
            temperature: 0.2,
            messages:
              [ { role: 'system',
                  content: SYSTEM_PROMPT },
                { role: 'user',
                  content: prompt } ] }) });

  if (!response.ok) {
    const errorPayload =
      await response.json().catch(() => ({} as Record<string, unknown>));

    const message =
      getOpenAiErrorMessage(errorPayload)
      ?? `OpenAI API error: ${response.status}`;

    throw new Error(message);
  }

  const data =
    await response.json() as Record<string, unknown>;

  const raw =
    getContentFromChatResponse(data);

  const parsed =
    parseGenerationResult(raw);

  if (parsed.files.length === 0) {
    throw new Error('AI returned no files.');
  }

  return parsed;
}

function buildSystemPrompt(
  ): string
{
  const packageVersions =
    `
      Latest ASLJS package versions to use:
      - asljs-eventful@${EVENTFUL_VERSION}
      - asljs-observable@${OBSERVABLE_VERSION}
      - asljs-data-binding@${DATA_BINDING_VERSION}
      - asljs-components@${COMPONENTS_VERSION}
      - asljs-dali@${DALI_VERSION}
    `;

  const docsBundle =
    [ buildPackageSection('eventful', eventfulReadme, eventfulIndex),
      buildPackageSection('observable', observableReadme, observableIndex),
      buildPackageSection('data-binding', dataBindingReadme, dataBindingIndex),
      buildPackageSection('components', componentsReadme, componentsIndex),
      buildPackageSection('dali', daliReadme, daliIndex) ]
      .join('\n\n');

  return `
You are an expert ASLJS app generator.

The generated app is a showcase of ASLJS libraries. Use ALL of these packages in useful, visible ways:
- asljs-eventful
- asljs-observable
- asljs-data-binding
- asljs-components
- asljs-dali

${packageVersions}

Output requirements:
- Return JSON only (no markdown, no prose), with this exact shape:
  {
    "description": "one-sentence description",
    "files": [
      { "name": "index.html", "content": "..." },
      { "name": "style.css", "content": "..." },
      { "name": "app.js", "content": "..." },
      { "name": "package.json", "content": "..." },
      { "name": "README.md", "content": "..." }
    ]
  }

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- package.json must include latest versions listed above.
- app.js must demonstrate practical usage of ALL five ASLJS packages.
- index.html must load app.js using <script type="module">.
- Prefer real app behavior over toy snippets (state, events, bindings, local persistence, and at least one ASLJS component).
- Keep code concise, runnable in modern browser, and readable.

Use this package knowledge as source material when choosing APIs and patterns:
${docsBundle}
`.trim();
}

function buildPackageSection(
    name: string,
    readme: string,
    indexSource: string
  ): string
{
  return `
[${name}] README excerpt:
${truncate(readme, 9000)}

[${name}] exported API/types excerpt:
${truncate(indexSource, 6000)}
`.trim();
}

function truncate(
    text: string,
    maxLength: number
  ): string
{
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n... [truncated]`;
}

function readPackageVersion(
    packageRaw: string,
    packageName: string
  ): string
{
  try {
    const parsed =
      JSON.parse(packageRaw) as { version?: string; };

    return parsed.version ?? 'latest';
  } catch {
    console.warn(`Failed to parse package metadata for ${packageName}.`);
    return 'latest';
  }
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

function getContentFromChatResponse(
    data: Record<string, unknown>
  ): string
{
  const choices =
    data.choices as Array<Record<string, unknown>> | undefined;

  const firstChoice =
    choices?.[0];

  const message =
    firstChoice?.message as Record<string, unknown> | undefined;

  const content =
    message?.content;

  if (typeof content !== 'string') {
    throw new Error('AI returned an unexpected response format.');
  }

  return content;
}

function parseGenerationResult(
    raw: string
  ): GenerateAppResult
{
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI returned invalid JSON.');
  }

  if (!isGenerateAppResult(parsed)) {
    throw new Error('AI returned an unexpected response shape.');
  }

  return parsed;
}

function isGenerateAppResult(
    value: unknown
  ): value is GenerateAppResult
{
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate =
    value as { description?: unknown; files?: unknown; };

  if (typeof candidate.description !== 'string') {
    return false;
  }

  if (!Array.isArray(candidate.files)) {
    return false;
  }

  return candidate.files.every(isGeneratedFile);
}

function isGeneratedFile(
    value: unknown
  ): value is GeneratedFile
{
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate =
    value as { name?: unknown; content?: unknown; };

  return typeof candidate.name === 'string'
      && typeof candidate.content === 'string';
}
