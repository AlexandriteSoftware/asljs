export type ResponseFunctionCall =
  { type: 'function_call';
    name?: string;
    arguments?: string | Record<string, unknown>;
    call_id?: string; };

export type ResponseFunctionCallOutput =
  { type: 'function_call_output';
    call_id: string;
    output: string; };

export type AiTools =
  { listFileset: (
      ) => Promise<string[]>;
    readFile: (
        path: string
      ) => Promise<string>;
    setFileContent: (
        path: string,
        content: string
      ) => Promise<void>;
    deleteFile: (
        path: string
      ) => Promise<void>;
    replaceFilePart: (
        path: string,
        search: string,
        replacement: string,
        replaceAll?: boolean,
      ) => Promise<void>;
    evalInApp: (
        code: string
      ) => Promise<unknown>;
    getAppDiagnostics: (
      ) => Promise<unknown>;
    runAppAndCollectDiagnostics: (
      ) => Promise<unknown>; };

export type AiToolFileRecord =
  { id: string;
    appId: string;
    name: string;
    content: string; };

export type AiToolsRuntimeContext =
  { getCurrentAppId: (
      ) => string | null;
    getFiles: (
      ) => AiToolFileRecord[];
    setFiles: (
        files: AiToolFileRecord[]
      ) => void;
    getActiveFileName: (
      ) => string | null;
    setActiveFileName: (
        fileName: string | null
      ) => void;
    createFileId: (
      ) => string;
    saveFile: (
        file: AiToolFileRecord
      ) => Promise<void>;
    deleteFileById: (
        id: string
      ) => Promise<void>;
    runApp: (
      ) => void;
    evaluateInApp: (
        code: string
      ) => Promise<unknown>;
    getAppDiagnostics: (
      ) => unknown | Promise<unknown>;
    wait: (
        milliseconds: number
      ) => Promise<void>;
    diagnosticsDelayMs?: number; };

export type OpenAiToolDefinition =
  { name: string;
    type: 'function';
    description: string;
    parameters:
      { type: 'object';
        properties: Record<string, { type: string }>;
        required: string[];
        additionalProperties: false; };
    strict: true; };

function openAiToolDefinition(
    name: string,
    description: string,
    properties?: Record<string, { type: string }>,
    required?: string[],
  ) : OpenAiToolDefinition
{
  return { name,
           type: 'function',
           description,
           parameters:
             { type: 'object',
               properties: properties || { },
               required: required || [ ],
               additionalProperties: false },
           strict: true };
}

export const OPENAI_TOOLS: OpenAiToolDefinition[] =
  [ openAiToolDefinition(
      'listFileset',
      'List all file paths in the virtual filesystem.'),
    openAiToolDefinition(
      'readFile',
      'Read the full text content of a file.',
      { path: { type: 'string' } },
      [ 'path' ]),
    openAiToolDefinition(
        'setFileContent',
      'Create or fully replace file content.',
      { path: { type: 'string' },
        content: { type: 'string' } },
      [ 'path', 'content' ]),
    openAiToolDefinition(
      'replaceFilePart',
      'Replace part of a file by exact search string.',
      { path: { type: 'string' },
        search: { type: 'string' },
        replacement: { type: 'string' },
        replaceAll: { type: 'boolean' } },
      [ 'path', 'search', 'replacement', 'replaceAll' ]),
    openAiToolDefinition(
      'deleteFile',
      'Delete a file from the virtual filesystem.',
      { path: { type: 'string' } },
      [ 'path' ]),
    openAiToolDefinition(
      'evalInApp',
      'Evaluate JavaScript in the running app document context.',
      { code: { type: 'string' } },
      [ 'code' ]),
    openAiToolDefinition(
      'getAppDiagnostics',
      'Get current runtime logs and errors from the running app.'),
    openAiToolDefinition(
      'runAppAndCollectDiagnostics',
      'Run the app and collect runtime logs and errors after startup.') ];

const DEFAULT_DIAGNOSTICS_DELAY_MS = 350;

export function createAppRuntimeTools(
    context: AiToolsRuntimeContext
  ): AiTools
{
  async function listFilesetTool(): Promise<string[]> {
    return [ ...context.getFiles() ]
      .map(file => file.name)
      .sort((left, right) => left.localeCompare(right));
  }

  async function readFileTool(path: string): Promise<string> {
    const resolvedPath = resolveExistingPath(context, path);

    const file =
      resolvedPath === null
        ? undefined
        : context.getFiles().find(item => item.name === resolvedPath);

    if (file === undefined) {
      throw new Error(`File not found: ${path}`);
    }

    return file.content;
  }

  async function setFileContentTool(
      path: string,
      content: string,
    ): Promise<void>
  {
    const appId = requireCurrentAppId(context);
    const normalizedPath = normalizeToolPath(path);
    const resolvedPath = resolveExistingPath(context, normalizedPath);

    const existing = context
      .getFiles()
      .find(item => item.name === (resolvedPath ?? normalizedPath));

    if (existing !== undefined) {
      const updated: AiToolFileRecord = {
        ...existing,
        content,
      };

      await context.saveFile(updated);
      context.setFiles(
        context
          .getFiles()
          .map(item =>
            item.id === updated.id
              ? updated
              : item));
      context.setActiveFileName(updated.name);
      return;
    }

    const created: AiToolFileRecord = {
      id: context.createFileId(),
      appId,
      name: normalizedPath,
      content,
    };

    await context.saveFile(created);
    context.setFiles([ ...context.getFiles(), created ]);
    context.setActiveFileName(created.name);
  }

  async function deleteFileTool(path: string): Promise<void> {
    const resolvedPath = resolveExistingPath(context, path);

    const file =
      resolvedPath === null
        ? undefined
        : context.getFiles().find(item => item.name === resolvedPath);

    if (file === undefined) {
      return;
    }

    await context.deleteFileById(file.id);

    const remaining = context.getFiles().filter(item => item.id !== file.id);
    context.setFiles(remaining);

    if (context.getActiveFileName() === path) {
      context.setActiveFileName(remaining[0]?.name ?? null);
    }
  }

  async function replaceFilePartTool(
      path: string,
      search: string,
      replacement: string,
      replaceAll = false,
    ): Promise<void>
  {
    if (search === '') {
      throw new Error('Search text cannot be empty.');
    }

    const resolvedPath = resolveExistingPath(context, path);

    if (resolvedPath === null) {
      throw new Error(`File not found: ${path}`);
    }

    const original = await readFileTool(resolvedPath);

    if (!original.includes(search)) {
      throw new Error(`Search text not found in ${resolvedPath}.`);
    }

    let next = original;

    if (replaceAll) {
      next = original.split(search).join(replacement);
    } else {
      const firstIndex = original.indexOf(search);
      const secondIndex = original.indexOf(search, firstIndex + search.length);

      if (secondIndex !== -1) {
        throw new Error(
          'Search text is ambiguous. Use replaceAll=true or provide a more specific search block.');
      }

      next =
        original.slice(0, firstIndex)
        + replacement
        + original.slice(firstIndex + search.length);
    }

    await setFileContentTool(resolvedPath, next);
  }

  async function evalInAppTool(code: string): Promise<unknown> {
    if (context.getFiles().length === 0) {
      throw new Error('No files available to run.');
    }

    context.runApp();

    try {
      return await context.evaluateInApp(code);
    } catch {
      context.runApp();
      return context.evaluateInApp(code);
    }
  }

  async function getAppDiagnosticsTool(): Promise<unknown> {
    return context.getAppDiagnostics();
  }

  async function runAppAndCollectDiagnosticsTool(): Promise<unknown> {
    context.runApp();
    await context.wait(
      context.diagnosticsDelayMs ?? DEFAULT_DIAGNOSTICS_DELAY_MS);
    return context.getAppDiagnostics();
  }

  return {
    listFileset: listFilesetTool,
    readFile: readFileTool,
    setFileContent: setFileContentTool,
    deleteFile: deleteFileTool,
    replaceFilePart: replaceFilePartTool,
    evalInApp: evalInAppTool,
    getAppDiagnostics: getAppDiagnosticsTool,
    runAppAndCollectDiagnostics: runAppAndCollectDiagnosticsTool,
  };
}

function requireCurrentAppId(context: AiToolsRuntimeContext): string {
  const appId = context.getCurrentAppId();

  if (appId === null) {
    throw new Error('No active app. Create or open an app first.');
  }

  return appId;
}

function normalizeToolPath(path: string): string {
  const normalized = path
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');

  if (normalized === '') {
    throw new Error('Path cannot be empty.');
  }

  if (normalized.includes('..')) {
    throw new Error('Parent path segments are not allowed.');
  }

  return normalized;
}

function resolveExistingPath(
    context: AiToolsRuntimeContext,
    path: string,
  ): string | null
{
  const normalizedPath = normalizeToolPath(path);

  const found = context.getFiles().find(item =>
    normalizeToolPath(item.name).toLowerCase() === normalizedPath.toLowerCase());

  return found?.name ?? null;
}

export function isResponseFunctionCall(
    value: unknown
  ): value is ResponseFunctionCall
{
  if (typeof value !== 'object' || value === null)
    return false;

  return (value as { type?: unknown; }).type === 'function_call';
}

export function readFunctionName(
    toolCall: ResponseFunctionCall
  ): string
{
  if (typeof toolCall.name !== 'string' || toolCall.name.trim() === '') {
    throw new Error('Tool call missing function name.');
  }

  return toolCall.name;
}

export function readCallId(
    toolCall: ResponseFunctionCall
  ): string
{
  if (typeof toolCall.call_id !== 'string' || toolCall.call_id.trim() === '') {
    throw new Error('Tool call missing call_id.');
  }

  return toolCall.call_id;
}

export async function executeToolCall(
    toolCall: ResponseFunctionCall,
    tools: AiTools,
  ): Promise<string>
{
  const name = readFunctionName(toolCall);
  const args = parseToolArguments(toolCall.arguments);

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
          readStringArg(args, 'content'));
        return toolSuccess('ok');
      }

      case 'replaceFilePart': {
        await tools.replaceFilePart(
          readStringArg(args, 'path'),
          readStringArg(args, 'search'),
          readStringArg(args, 'replacement'),
          readBooleanArg(args, 'replaceAll', false));
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

      case 'getAppDiagnostics': {
        const result = await tools.getAppDiagnostics();
        return toolSuccess(result);
      }

      case 'runAppAndCollectDiagnostics': {
        const result = await tools.runAppAndCollectDiagnostics();
        return toolSuccess(result);
      }

      default:
        return toolFailure(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return toolFailure(
      error instanceof Error
        ? error.message
        : String(error));
  }
}

function parseToolArguments(
    raw: string | Record<string, unknown> | undefined,
  ): Record<string, unknown>
{
  if (raw === undefined) {
    return {};
  }

  if (typeof raw === 'object' && raw !== null) {
    return raw;
  }

  if (typeof raw !== 'string') {
    throw new Error('Invalid tool arguments value.');
  }

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
  ): string
{
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
  ): boolean
{
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
