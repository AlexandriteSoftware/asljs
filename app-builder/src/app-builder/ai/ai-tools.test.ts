import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  type AiToolFileRecord,
  type AiTools,
  OPENAI_TOOLS,
  createAppRuntimeTools,
  executeToolCall,
  isResponseFunctionCall,
  readCallId,
  readFunctionName,
} from './ai-tools.js';

function makeFile(
    overrides?: Partial<AiToolFileRecord>
  ): AiToolFileRecord
{
  return {
    id: overrides?.id ?? 'f1',
    appId: overrides?.appId ?? 'a1',
    name: overrides?.name ?? 'index.html',
    content: overrides?.content ?? 'hello world',
  };
}

test(
  'all tool schemas use strict + additionalProperties=false',
  () => {
    for (const tool of OPENAI_TOOLS) {
      assert.equal(tool.type, 'function');
      assert.equal(tool.strict, true);
      assert.equal(tool.parameters.type, 'object');
      assert.equal(tool.parameters.additionalProperties, false);
    }
  });

test(
  'required includes every property key for each tool schema',
  () => {
    for (const tool of OPENAI_TOOLS) {
      const propertyKeys =
        Object.keys(tool.parameters.properties).sort();

      const requiredKeys =
        [...tool.parameters.required].sort();

      assert.deepEqual(
        requiredKeys,
        propertyKeys,
        `${tool.name}: required must exactly match properties keys`,
      );
    }
  });

test(
  'replaceFilePart schema requires replaceAll',
  () => {
    const tool =
      OPENAI_TOOLS
        .find(item => item.name === 'replaceFilePart');

    assert.notEqual(
      tool,
      undefined);

    if (tool === undefined) {
      throw new Error(
        'replaceFilePart tool is missing');
    }

    assert.deepEqual(
      [...tool.parameters.required].sort(),
      [ 'path',
        'replaceAll',
        'replacement',
        'search' ]);
  });

test(
  'isResponseFunctionCall returns true only for function_call payload',
  () => {
    assert.equal(
      isResponseFunctionCall({ type: 'function_call' }),
      true);

    assert.equal(
      isResponseFunctionCall({ type: 'message' }),
      false);

    assert.equal(
      isResponseFunctionCall(null),
      false);
  });

test(
  'readFunctionName and readCallId read valid tool call fields',
  () => {
    const toolCall =
      { type: 'function_call' as const,
        name: 'readFile',
        call_id: 'c_1' };

    assert.equal(
      readFunctionName(toolCall),
      'readFile');

    assert.equal(
      readCallId(toolCall),
      'c_1');
  });

test(
  'readFunctionName throws for missing name',
  () => {
    assert.throws(
      () => readFunctionName({ type: 'function_call' }),
      /Tool call missing function name\./);
  });

test(
  'executeToolCall handles readFile with JSON string arguments',
  async () => {
    const seenPaths: string[] = [];

    const tools: AiTools =
      { listFileset: async () => [],
        readFile: async path => {
          seenPaths.push(path);
          return `content:${path}`;
        },
        setFileContent: async () => undefined,
        deleteFile: async () => undefined,
        replaceFilePart: async () => undefined,
        evalInApp: async () => null,
        getAppDiagnostics: async () => null,
        runAppAndCollectDiagnostics: async () => null };

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'readFile',
          arguments: '{"path":"app.js"}' },
        tools);

    assert.deepEqual(seenPaths, [ 'app.js' ]);
    assert.equal(
      output,
      '{"ok":true,"value":"content:app.js"}');
  });

test(
  'executeToolCall returns tool failure for unknown tool',
  async () => {
    const tools: AiTools =
      { listFileset: async () => [],
        readFile: async () => '',
        setFileContent: async () => undefined,
        deleteFile: async () => undefined,
        replaceFilePart: async () => undefined,
        evalInApp: async () => null,
        getAppDiagnostics: async () => null,
        runAppAndCollectDiagnostics: async () => null };

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'not-real-tool' },
        tools);

    assert.equal(
      output,
      '{"ok":false,"error":"Unknown tool: not-real-tool"}');
  });

test(
  'executeToolCall returns tool failure when tool throws',
  async () => {
    const tools: AiTools =
      { listFileset: async () => [],
        readFile: async () => {
          throw new Error('boom');
        },
        setFileContent: async () => undefined,
        deleteFile: async () => undefined,
        replaceFilePart: async () => undefined,
        evalInApp: async () => null,
        getAppDiagnostics: async () => null,
        runAppAndCollectDiagnostics: async () => null };

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'readFile',
          arguments: { path: 'x' } },
        tools);

    assert.equal(
      output,
      '{"ok":false,"error":"boom"}');
  });

test(
  'createAppRuntimeTools setFileContent creates file with normalized path',
  async () => {
    let files: AiToolFileRecord[] = [];
    let activeFileName: string | null = null;
    const savedFiles: AiToolFileRecord[] = [];

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => files,
        setFiles: next => {
          files = next;
        },
        getActiveFileName: () => activeFileName,
        setActiveFileName: next => {
          activeFileName = next;
        },
        createFileId: () => 'new-file-id',
        saveFile: async file => {
          savedFiles.push(file);
        },
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        wait: async () => undefined,
      });

    await tools.setFileContent('./src\\app.js', 'console.log(1);');

    assert.equal(files.length, 1);
    assert.equal(files[0].name, 'src/app.js');
    assert.equal(files[0].content, 'console.log(1);');
    assert.equal(activeFileName, 'src/app.js');
    assert.equal(savedFiles.length, 1);
    assert.equal(savedFiles[0].id, 'new-file-id');
  });

test(
  'createAppRuntimeTools replaceFilePart throws when search is ambiguous',
  async () => {
    let files: AiToolFileRecord[] = [
      makeFile({
        name: 'README.md',
        content: 'x marker x marker',
      }),
    ];

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => files,
        setFiles: next => {
          files = next;
        },
        getActiveFileName: () => files[0]?.name ?? null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        wait: async () => undefined,
      });

    await assert.rejects(
      () => tools.replaceFilePart('README.md', 'marker', 'MARKER'),
      /Search text is ambiguous\./);
  });

test(
  'createAppRuntimeTools evalInApp retries once after run',
  async () => {
    let runCount = 0;
    let evalCount = 0;

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [ makeFile() ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => {
          runCount += 1;
        },
        evaluateInApp: async () => {
          evalCount += 1;

          if (evalCount === 1) {
            throw new Error('first attempt fails');
          }

          return 'ok';
        },
        getAppDiagnostics: async () => null,
        wait: async () => undefined,
      });

    const result = await tools.evalInApp('1 + 1');

    assert.equal(result, 'ok');
    assert.equal(runCount, 2);
    assert.equal(evalCount, 2);
  });

test(
  'createAppRuntimeTools runAppAndCollectDiagnostics uses wait and diagnostics',
  async () => {
    const calls: string[] = [];

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => {
          calls.push('run');
        },
        evaluateInApp: async () => null,
        getAppDiagnostics: () => {
          calls.push('diag');
          return { ok: true };
        },
        wait: async milliseconds => {
          calls.push(`wait:${milliseconds}`);
        },
        diagnosticsDelayMs: 123,
      });

    const result = await tools.runAppAndCollectDiagnostics();

    assert.deepEqual(calls, [ 'run', 'wait:123', 'diag' ]);
    assert.deepEqual(result, { ok: true });
  });
