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
import {
  OPENAI_TOOLS,
} from './ai-tools.js';

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

export type AiModel = 'gpt-5.3-codex' | 'gpt-5.4';

export const DEFAULT_MODEL: AiModel = 'gpt-5.3-codex';

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

const MAX_TOOL_STEPS = 24;

type AiTools = {
  listFileset: () => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  setFileContent: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  replaceFilePart: (
    path: string,
    search: string,
    replacement: string,
    replaceAll?: boolean,
  ) => Promise<void>;
  evalInApp: (code: string) => Promise<unknown>;
};

type AgentRunResult = {
  summary: string;
};

type ChatToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ChatToolCall[];
};

export async function generateApp(
  prompt: string,
  apiKey: string,
  model: AiModel,
  tools: AiTools,
): Promise<AgentRunResult>
{
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages,
        tools: OPENAI_TOOLS,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorPayload =
        await response.json().catch(() => ({} as Record<string, unknown>));

      const message =
        getOpenAiErrorMessage(errorPayload)
        ?? `OpenAI API error: ${response.status}`;

      throw new Error(message);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: ChatMessage }>;
    };

    const message = data.choices?.[0]?.message;

    if (message === undefined) {
      throw new Error('AI returned an unexpected response format.');
    }

    const toolCalls = message.tool_calls ?? [];

    if (toolCalls.length === 0) {
      const summary = message.content.trim();

      return {
        summary: summary === ''
          ? 'Completed tool-based update.'
          : summary,
      };
    }

    messages.push({
      role: 'assistant',
      content: message.content,
      tool_calls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      const toolOutput = await executeToolCall(toolCall, tools);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolOutput,
      });
    }
  }

  throw new Error('AI exceeded maximum tool steps without completing.');
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

Response requirements:
- Use tool calls for file and runtime operations.
- Do not return a full files JSON snapshot.
- Return a short plain-text summary only after updates are complete.

Tool-first generation protocol (stability-first):
- Always work in small, incremental steps:
  1) inspect current files/state,
  2) edit one focused thing,
  3) verify app behavior,
  4) fix issues,
  5) repeat until stable.
- Prefer targeted updates (replace specific file parts) over full rewrites.
- Use setFileContent only when replaceFilePart is not suitable.
- Verify each major change using evalInApp.
- Use JSON only for explicit import/export content handled by the app itself.

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- package.json must include latest versions listed above.
- app.js must demonstrate practical usage of ALL five ASLJS packages.
- app.js is the app entry point.
- index.html must load app.js using <script type="module">.
- UI code must be data-binding-first: prefer declarative \`data-bind-*\` attributes with \`bindDataModel\`.
- For UI updates, prefer model changes that automatically re-render through bindings.
- Avoid imperative DOM mutation patterns for normal UI state changes (manual \`innerHTML\` rebuild loops, ad-hoc query-and-set chains).
- Use imperative DOM code only for unavoidable integration points, and keep it minimal.
- Prefer real app behavior over toy snippets (state, events, bindings, local persistence, and at least one ASLJS component).
- Keep code concise, runnable in modern browser, and readable.

Stability contract (minimize generation failures):
- Prefer a small, deterministic architecture over clever patterns.
- Keep all runtime logic in app.js unless splitting is necessary.
- Do not reference files that do not exist in the current virtual filesystem.
- Do not use placeholders, TODOs, pseudo-code, or omitted sections.
- Avoid dynamic imports and avoid network/runtime external dependencies.
- Guard all DOM queries and event wiring against missing elements.
- Wrap startup in a safe boot path with clear error handling.
- Ensure app initialization is idempotent (safe to run more than once).
- Keep CSS simple and resilient; avoid assumptions about unavailable fonts/assets.

Implementation reliability rules:
- index.html must contain the actual mount/root element used by app.js.
- app.js must only use APIs available in modern browsers and must not require build-time transforms.
- package.json scripts must be coherent and runnable (at least a valid start/dev flow).
- All referenced ASLJS APIs must match the provided package docs/types excerpts.
- Prefer \`asljs-data-binding\` for form fields, labels, visibility flags, and action wiring.
- When using \`asljs-components\`, bind row/content templates through data-binding context instead of manual DOM writes.
- For data persistence, handle empty/first-run states and corrupted data gracefully.
- For asynchronous flows, handle rejection paths and surface readable errors.

Pre-flight self-check before final response:
- Verify file graph consistency: every referenced local file exists.
- Verify boot consistency: index.html loads app.js and app.js mounts to an existing element.
- Verify no syntax-fragment artifacts (unclosed tags, truncated strings, unfinished blocks).
- Verify at least one concrete usage of each required ASLJS package.
- Verify UI behavior is primarily implemented with \`asljs-data-binding\` (not imperative DOM patching).
- Verify generated README explains how to run and what the agent tools do.

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - readFile(path): returns full text content for a file.
  - setFileContent(path, content): creates or replaces a file's content.
  - replaceFilePart(path, search, replacement, replaceAll?): replaces exact text in a file.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).

In-app agent update protocol:
- For normal edits, the in-app agent must update files through tools:
  - inspect with listFileset/readFile
  - modify with replaceFilePart first; use setFileContent for create/full replace
  - remove with deleteFile when appropriate
- JSON should be used only for explicit export/import workflows.

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- The agent must verify the app is running (for example by using evalInApp checks against the loaded document).
- If the app is not running, the agent must iteratively adjust files via setFileContent/deleteFile,
- If the app is not running, the agent must iteratively adjust files via replaceFilePart/setFileContent/deleteFile,
  then re-check until the app runs.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

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

async function executeToolCall(
  toolCall: ChatToolCall,
  tools: AiTools,
): Promise<string> {
  const name = toolCall.function.name;
  const args = parseToolArguments(toolCall.function.arguments);

  try {
    switch (name) {
      case 'listFileset': {
        const result = await tools.listFileset();
        return toolSuccess(result);
      }

      case 'readFile': {
        const result = await tools.readFile(readStringArg(args, 'path'));
        return toolSuccess(result);
      }

      case 'setFileContent': {
        await tools.setFileContent(
          readStringArg(args, 'path'),
          readStringArg(args, 'content'),
        );
        return toolSuccess('ok');
      }

      case 'replaceFilePart': {
        await tools.replaceFilePart(
          readStringArg(args, 'path'),
          readStringArg(args, 'search'),
          readStringArg(args, 'replacement'),
          readBooleanArg(args, 'replaceAll', false),
        );
        return toolSuccess('ok');
      }

      case 'deleteFile': {
        await tools.deleteFile(readStringArg(args, 'path'));
        return toolSuccess('ok');
      }

      case 'evalInApp': {
        const result = await tools.evalInApp(readStringArg(args, 'code'));
        return toolSuccess(result);
      }

      default:
        return toolFailure(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return toolFailure(error instanceof Error
? error.message
: String(error));
  }
}

function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Tool arguments must be a JSON object.');
    }

    return parsed as Record<string, unknown>;
  } catch {
    throw new Error('Invalid tool arguments JSON.');
  }
}

function readStringArg(
  args: Record<string, unknown>,
  key: string,
): string {
  const value = args[key];

  if (typeof value !== 'string') {
    throw new Error(`Tool argument "${key}" must be a string.`);
  }

  return value;
}

function readBooleanArg(
  args: Record<string, unknown>,
  key: string,
  defaultValue: boolean,
): boolean {
  const value = args[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`Tool argument "${key}" must be a boolean.`);
  }

  return value;
}

function toolSuccess(value: unknown): string {
  return stringifyToolPayload({
    ok: true,
    value,
  });
}

function toolFailure(error: string): string {
  return stringifyToolPayload({
    ok: false,
    error,
  });
}

function stringifyToolPayload(payload: Record<string, unknown>): string {
  try {
    return JSON.stringify(payload);
  } catch {
    return '{"ok":false,"error":"Failed to serialize tool result."}';
  }
}
