export type ResponseFunctionCall =
  { type: 'function_call';
    name?: string;
    arguments?: string | Record<string, unknown>;
    call_id?: string; };

export type ResponseFunctionCallOutput =
  { type: 'function_call_output';
    call_id: string;
    output: string; };

import {
  readFileDataInfo,
} from '../file-data.js';

type AppTestCase =
  { name: string;
    run: (helpers: AppTestHelpers) => Promise<void>; };

type AppTestHelpers =
  { evalInApp: (
        code: string
      ) => Promise<unknown>;
    assertInApp: (
        code: string,
        message?: string
      ) => Promise<unknown>;
    getAppDiagnostics: (
      ) => Promise<unknown>;
    wait: (
        milliseconds: number
      ) => Promise<void>; };

type AppTestModuleCase =
  { name?: unknown;
    run?: unknown; };

type AppTestResult =
  { name: string;
    ok: boolean;
    error?: string; };

type FileContentEntry =
  { path: string;
    content: string; };

export type AiTools =
  { listFileset: (
      ) => Promise<string[]>;
    listFilesByMask: (
        mask: string,
        maxFiles?: number
      ) => Promise<string[]>;
    readFile: (
        path: string
      ) => Promise<string>;
    readFiles: (
        paths: string[],
        maxCharsPerFile?: number
      ) => Promise<Record<string, string>>;
    readFilesByMask: (
        mask: string,
        maxFiles?: number,
        maxCharsPerFile?: number
      ) => Promise<Record<string, string>>;
    readFileData: (
        path: string
      ) => Promise<
        { mimeType: string;
          base64: string;
          dataUrl: string; } | null>;
    setFilesContent: (
        files: FileContentEntry[]
      ) => Promise<void>;
    setFileData: (
        path: string,
        mimeType: string,
        base64: string
      ) => Promise<void>;
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
    grep: (
        mask: string,
        pattern: string,
        flags?: string,
        maxMatches?: number
      ) => Promise<Array<
        { path: string;
          line: number;
          text: string; }>>;
    choose: (
        question: string,
        options: string[]
      ) => Promise<void>;
    evalInApp: (
        code: string
      ) => Promise<unknown>;
    assertInApp: (
        code: string,
        message?: string
      ) => Promise<unknown>;
    runAppTests: (
        path?: string
      ) => Promise<
        { path: string;
          total: number;
          passed: number;
          failed: number;
          results: AppTestResult[]; }>;
    startGeneration: (
      ) => Promise<string>;
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
    showChoicePrompt: (
        question: string,
        options: string[]
      ) => void;
    startGeneration?: (
      ) => Promise<string>;
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
        properties: Record<string, ToolParameterSchema>;
        required: string[];
        additionalProperties: false; };
    strict: true; };

type ToolParameterSchema =
  { type: string;
    items?: ToolParameterSchema;
    properties?: Record<string, ToolParameterSchema>;
    required?: string[];
    additionalProperties?: boolean; };

function openAiToolDefinition(
    name: string,
    description: string,
    properties?: Record<string, ToolParameterSchema>,
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
      'listFilesByMask',
      'List file paths that match a glob-like mask such as src/*.js or assets/**/*.png.',
      { mask: { type: 'string' },
        maxFiles: { type: 'number' } },
      [ 'mask', 'maxFiles' ]),
    openAiToolDefinition(
      'readFile',
      'Read the full text content of a file.',
      { path: { type: 'string' } },
      [ 'path' ]),
    openAiToolDefinition(
      'readFiles',
      'Read several files in one step. Use maxCharsPerFile to cap each returned file content.',
      { paths: { type: 'array', items: { type: 'string' } },
        maxCharsPerFile: { type: 'number' } },
      [ 'paths', 'maxCharsPerFile' ]),
    openAiToolDefinition(
      'readFilesByMask',
      'Read all files that match a glob-like mask in one step. Use maxFiles and maxCharsPerFile to keep results bounded.',
      { mask: { type: 'string' },
        maxFiles: { type: 'number' },
        maxCharsPerFile: { type: 'number' } },
      [ 'mask', 'maxFiles', 'maxCharsPerFile' ]),
    openAiToolDefinition(
      'readFileData',
      'Read a binary-safe file stored as a data URL. Returns MIME type, base64 payload, and data URL, or null when the file is plain text.',
      { path: { type: 'string' } },
      [ 'path' ]),
    openAiToolDefinition(
      'setFilesContent',
      'Create or fully replace several text files in one step.',
      { files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              content: { type: 'string' },
            },
            required: [ 'path', 'content' ],
            additionalProperties: false,
          },
        } },
      [ 'files' ]),
    openAiToolDefinition(
      'setFileData',
      'Create or replace a binary-safe file from base64 data. Use this for image assets that should be referenced by path from HTML or CSS.',
      { path: { type: 'string' },
        mimeType: { type: 'string' },
        base64: { type: 'string' } },
      [ 'path', 'mimeType', 'base64' ]),
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
      'grep',
      'Search matching files with a regular expression and return matching lines.',
      { mask: { type: 'string' },
        pattern: { type: 'string' },
        flags: { type: 'string' },
        maxMatches: { type: 'number' } },
      [ 'mask', 'pattern', 'flags', 'maxMatches' ]),
    openAiToolDefinition(
      'choose',
      'Show a short list of clickable choices in the chat UI. Use this when asking the user to pick from a few clear options.',
      { question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } } },
      [ 'question', 'options' ]),
    openAiToolDefinition(
      'evalInApp',
      'Evaluate JavaScript in the running app document context.',
      { code: { type: 'string' } },
      [ 'code' ]),
    openAiToolDefinition(
      'assertInApp',
      'Run a JavaScript check in the app context and fail if it throws or returns false.',
      { code: { type: 'string' },
        message: { type: 'string' } },
      [ 'code', 'message' ]),
    openAiToolDefinition(
      'runAppTests',
      'Run the JavaScript test module stored in app.tests.js or another specified file. The app restarts before each test.',
      { path: { type: 'string' } },
      [ 'path' ]),
    openAiToolDefinition(
      'startGeneration',
      'Queue the generation lane to start after the current chat turn finishes.'),
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

  async function listFilesByMaskTool(
      mask: string,
      maxFiles = 100,
    ): Promise<string[]>
  {
    return getMatchingPaths(context, mask, maxFiles);
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

  async function readFilesTool(
      paths: string[],
      maxCharsPerFile = 0,
    ): Promise<Record<string, string>>
  {
    const result: Record<string, string> = {};

    for (const path of paths) {
      result[path] = limitToolText(
        await readFileTool(path),
        maxCharsPerFile,
      );
    }

    return result;
  }

  async function readFilesByMaskTool(
      mask: string,
      maxFiles = 100,
      maxCharsPerFile = 0,
    ): Promise<Record<string, string>>
  {
    return readFilesTool(
      await listFilesByMaskTool(mask, maxFiles),
      maxCharsPerFile,
    );
  }

  async function readFileDataTool(
      path: string,
    ): Promise<
      { mimeType: string;
        base64: string;
        dataUrl: string; } | null>
  {
    return readFileDataInfo(await readFileTool(path));
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

  async function setFileDataTool(
      path: string,
      mimeType: string,
      base64: string,
    ): Promise<void>
  {
    await setFileContentTool(
      path,
      `data:${normalizeMimeType(mimeType)};base64,${normalizeBase64Data(base64)}`);
  }

  async function setFilesContentTool(
      files: FileContentEntry[],
    ): Promise<void>
  {
    for (const file of files) {
      await setFileContentTool(file.path, file.content);
    }
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
      context.setActiveFileName(pickVisibleFileName(remaining));
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

  async function grepTool(
      mask: string,
      pattern: string,
      flags = '',
      maxMatches = 100,
    ): Promise<Array<
      { path: string;
        line: number;
        text: string; }>>
  {
    const matches: Array<
      { path: string;
        line: number;
        text: string; }> = [];
    const regex = createSearchRegex(pattern, flags);

    for (const path of getMatchingPaths(context, mask, Number.MAX_SAFE_INTEGER)) {
      const content = await readFileTool(path);
      const lines = content.split(/\r?\n/);

      for (let index = 0; index < lines.length; index += 1) {
        regex.lastIndex = 0;

        if (!regex.test(lines[index])) {
          continue;
        }

        matches.push({
          path,
          line: index + 1,
          text: lines[index],
        });

        if (matches.length >= maxMatches) {
          return matches;
        }
      }
    }

    return matches;
  }

  async function chooseTool(
      question: string,
      options: string[],
    ): Promise<void>
  {
    const normalizedQuestion = question.trim();
    const normalizedOptions = options
      .map(option => option.trim())
      .filter(option => option !== '');

    if (normalizedQuestion === '') {
      throw new Error('Choice question cannot be empty.');
    }

    if (normalizedOptions.length < 2) {
      throw new Error('Choice options must include at least two items.');
    }

    context.showChoicePrompt(normalizedQuestion, normalizedOptions);
  }

  async function assertInAppTool(
      code: string,
      message?: string,
    ): Promise<unknown>
  {
    const result = await evalInAppTool(code);

    if (result === false) {
      throw new Error(message?.trim() || 'App assertion returned false.');
    }

    return result;
  }

  async function runAppTestsTool(
      path = 'app.tests.js',
    ): Promise<
      { path: string;
        total: number;
        passed: number;
        failed: number;
        results: AppTestResult[]; }>
  {
    const resolvedPath = resolveExistingPath(context, path);

    if (resolvedPath === null) {
      throw new Error(`Test file not found: ${path}`);
    }

    const tests = await loadAppTests(
      resolvedPath,
      await readFileTool(resolvedPath));
    const results: AppTestResult[] = [];
    for (const testCase of tests) {
      try {
        context.runApp();
        await context.wait(context.diagnosticsDelayMs ?? DEFAULT_DIAGNOSTICS_DELAY_MS);
        const helpers: AppTestHelpers = {
          evalInApp: code => context.evaluateInApp(code),
          assertInApp: async (code, message) => {
            const result = await context.evaluateInApp(code);

            if (result === false) {
              throw new Error(message?.trim() || 'App assertion returned false.');
            }

            return result;
          },
          getAppDiagnostics: getAppDiagnosticsTool,
          wait: context.wait,
        };
        await testCase.run(helpers);

        results.push({
          name: testCase.name,
          ok: true,
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          ok: false,
          error: error instanceof Error
            ? error.message
            : String(error),
        });
      }
    }

    return {
      path: resolvedPath,
      total: results.length,
      passed: results.filter(result => result.ok).length,
      failed: results.filter(result => !result.ok).length,
      results,
    };
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

  async function startGenerationTool(): Promise<string> {
    if (context.startGeneration === undefined) {
      throw new Error('Generation control is not available in this lane.');
    }

    return context.startGeneration();
  }

  return {
    listFileset: listFilesetTool,
    listFilesByMask: listFilesByMaskTool,
    readFile: readFileTool,
    readFiles: readFilesTool,
    readFilesByMask: readFilesByMaskTool,
    readFileData: readFileDataTool,
    setFilesContent: setFilesContentTool,
    setFileData: setFileDataTool,
    setFileContent: setFileContentTool,
    deleteFile: deleteFileTool,
    replaceFilePart: replaceFilePartTool,
    grep: grepTool,
    choose: chooseTool,
    evalInApp: evalInAppTool,
    assertInApp: assertInAppTool,
    runAppTests: runAppTestsTool,
    startGeneration: startGenerationTool,
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

function isHiddenToolPath(path: string): boolean {
  return normalizeToolPath(path).startsWith('.');
}

function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();

  if (normalized === '') {
    throw new Error('MIME type cannot be empty.');
  }

  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(normalized)) {
    throw new Error(`Invalid MIME type: ${mimeType}`);
  }

  return normalized;
}

function normalizeBase64Data(base64: string): string {
  const trimmed =
    base64
      .trim()
      .replace(/^data:[^,]+,/, '')
      .replace(/\s+/g, '');

  if (trimmed === '') {
    throw new Error('Base64 data cannot be empty.');
  }

  if (!/^[a-z0-9+/]+=*$/i.test(trimmed)) {
    throw new Error('Base64 data contains invalid characters.');
  }

  return trimmed;
}

function limitToolText(value: string, maxCharsPerFile: number): string {
  if (!Number.isFinite(maxCharsPerFile) || maxCharsPerFile <= 0) {
    return value;
  }

  const limit = Math.floor(maxCharsPerFile);

  return value.length <= limit
    ? value
    : `${value.slice(0, limit)}\n...[truncated]`;
}

function getMatchingPaths(
    context: AiToolsRuntimeContext,
    mask: string,
    maxFiles: number,
  ): string[]
{
  const regex = createMaskRegex(mask);
  const limit = normalizePositiveInteger(maxFiles, 100);

  return context.getFiles()
    .map(file => file.name)
    .filter(path => regex.test(normalizeToolPath(path)))
    .sort((left, right) => left.localeCompare(right))
    .slice(0, limit);
}

function createMaskRegex(mask: string): RegExp {
  const normalizedMask = normalizeToolPath(mask);
  const pattern = normalizedMask
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/::DOUBLE_STAR::/g, '.*');

  return new RegExp(`^${pattern}$`, 'i');
}

function createSearchRegex(pattern: string, flags: string): RegExp {
  const normalizedFlags = Array.from(new Set(flags.replace(/g/g, '').split(''))).join('');
  return new RegExp(pattern, normalizedFlags);
}

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

async function loadAppTests(
    path: string,
    content: string,
  ): Promise<AppTestCase[]>
{
  return path.toLowerCase().endsWith('.json')
    ? parseLegacyJsonAppTests(content)
    : parseJavaScriptAppTests(content);
}

async function parseJavaScriptAppTests(content: string): Promise<AppTestCase[]> {
  const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(content)}`;
  const imported = await import(moduleUrl);
  const rawTests =
    Array.isArray(imported.default)
      ? imported.default
      : imported.default?.tests;

  if (!Array.isArray(rawTests)) {
    throw new Error('Test module must export an array or an object with a tests array as the default export.');
  }

  return rawTests.map((value, index) => normalizeModuleTestCase(value, index));
}

function normalizeModuleTestCase(
    value: unknown,
    index: number,
  ): AppTestCase
{
  if (value === null || typeof value !== 'object') {
    throw new Error(`Invalid test case at index ${index}.`);
  }

  const testCase = value as AppTestModuleCase;

  if (typeof testCase.name !== 'string' || testCase.name.trim() === '') {
    throw new Error(`Test case ${index + 1} is missing a name.`);
  }

  if (typeof testCase.run !== 'function') {
    throw new Error(`Test case ${testCase.name} is missing run().`);
  }

  const run = testCase.run;

  return {
    name: testCase.name,
    run: async helpers => {
      await run(helpers);
    },
  };
}

function parseLegacyJsonAppTests(content: string): AppTestCase[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Test suite file must be valid JSON.');
  }

  const rawTests =
    Array.isArray(parsed)
      ? parsed
      : (parsed as { tests?: unknown; }).tests;

  if (!Array.isArray(rawTests)) {
    throw new Error('Test suite file must be an array or an object with a tests array.');
  }

  return rawTests.map((value, index) => {
    if (value === null || typeof value !== 'object') {
      throw new Error(`Invalid test case at index ${index}.`);
    }

    const testCase = value as { name?: unknown; code?: unknown; };

    if (typeof testCase.name !== 'string' || testCase.name.trim() === '') {
      throw new Error(`Test case ${index + 1} is missing a name.`);
    }

    if (typeof testCase.code !== 'string' || testCase.code.trim() === '') {
      throw new Error(`Test case ${testCase.name} is missing code.`);
    }

    return {
      name: testCase.name,
      run: async helpers => {
        const result = await helpers.evalInApp(testCase.code as string);

        if (result === false) {
          throw new Error('Test returned false.');
        }
      },
    };
  });
}

function pickVisibleFileName(files: AiToolFileRecord[]): string | null {
  return files[0]?.name ?? null;
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

      case 'listFilesByMask': {
        const result = await tools.listFilesByMask(
          readStringArg(args, 'mask'),
          readNumberArg(args, 'maxFiles', 100));
        return toolSuccess(result);
      }

      case 'readFile': {
        const result = await tools.readFile(readStringArg(args, 'path'));
        return toolSuccess(result);
      }

      case 'readFiles': {
        const result = await tools.readFiles(
          readStringArrayArg(args, 'paths'),
          readNumberArg(args, 'maxCharsPerFile', 0));
        return toolSuccess(result);
      }

      case 'readFilesByMask': {
        const result = await tools.readFilesByMask(
          readStringArg(args, 'mask'),
          readNumberArg(args, 'maxFiles', 100),
          readNumberArg(args, 'maxCharsPerFile', 0));
        return toolSuccess(result);
      }

      case 'readFileData': {
        const result = await tools.readFileData(readStringArg(args, 'path'));
        return toolSuccess(result);
      }

      case 'setFilesContent': {
        await tools.setFilesContent(readFileContentEntriesArg(args, 'files'));
        return toolSuccess('ok');
      }

      case 'setFileData': {
        await tools.setFileData(
          readStringArg(args, 'path'),
          readStringArg(args, 'mimeType'),
          readStringArg(args, 'base64'));
        return toolSuccess('ok');
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

      case 'grep': {
        const result = await tools.grep(
          readStringArg(args, 'mask'),
          readStringArg(args, 'pattern'),
          readStringArg(args, 'flags', ''),
          readNumberArg(args, 'maxMatches', 100));
        return toolSuccess(result);
      }

      case 'choose': {
        await tools.choose(
          readStringArg(args, 'question'),
          readStringArrayArg(args, 'options'));
        return toolSuccess('ok');
      }

      case 'evalInApp': {
        const result = await tools.evalInApp(readStringArg(args, 'code'));
        return toolSuccess(result);
      }

      case 'assertInApp': {
        const result = await tools.assertInApp(
          readStringArg(args, 'code'),
          readStringArg(args, 'message', ''));
        return toolSuccess(result);
      }

      case 'runAppTests': {
        const result = await tools.runAppTests(readStringArg(args, 'path', 'app.tests.js'));
        return toolSuccess(result);
      }

      case 'startGeneration': {
        const result = await tools.startGeneration();
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
    defaultValue?: string,
  ): string
{
  const value = args[key];

  if (value === undefined && defaultValue !== undefined) {
    return defaultValue;
  }

  if (typeof value !== 'string') {
    throw new Error(`Tool argument "${key}" must be a string.`);
  }

  return value;
}

function readStringArrayArg(
    args: Record<string, unknown>,
    key: string,
  ): string[]
{
  const value = args[key];

  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`Tool argument "${key}" must be an array of strings.`);
  }

  return value as string[];
}

function readFileContentEntriesArg(
    args: Record<string, unknown>,
    key: string,
  ): FileContentEntry[]
{
  const value = args[key];

  if (!Array.isArray(value)) {
    throw new Error(`Tool argument "${key}" must be an array.`);
  }

  return value.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error(`Tool argument "${key}" entry ${index + 1} must be an object.`);
    }

    const file = entry as Record<string, unknown>;

    if (typeof file.path !== 'string' || typeof file.content !== 'string') {
      throw new Error(`Tool argument "${key}" entry ${index + 1} must include string path and content fields.`);
    }

    return {
      path: file.path,
      content: file.content,
    };
  });
}

function readNumberArg(
    args: Record<string, unknown>,
    key: string,
    defaultValue: number,
  ): number
{
  const value = args[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Tool argument "${key}" must be a number.`);
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
