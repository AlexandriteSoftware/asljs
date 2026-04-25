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

function makeToolsStub(
    overrides?: Partial<AiTools>,
  ): AiTools
{
  return {
    listFileset: async () => [],
    listFilesByMask: async () => [],
    readFile: async () => '',
    readFiles: async () => ({}),
    readFilesByMask: async () => ({}),
    readFileData: async () => null,
    setFilesContent: async () => undefined,
    setFileData: async () => undefined,
    setFileContent: async () => undefined,
    deleteFile: async () => undefined,
    replaceFilePart: async () => undefined,
    grep: async () => [],
    choose: async () => undefined,
    evalInApp: async () => null,
    assertInApp: async () => true,
    runAppTests: async () => ({
      path: 'app.tests.js',
      total: 0,
      passed: 0,
      failed: 0,
      results: [],
    }),
    startGeneration: async () => 'queued',
    getAppDiagnostics: async () => null,
    runAppAndCollectDiagnostics: async () => null,
    ...overrides,
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
  'setFilesContent schema uses array entries instead of free-form object maps',
  () => {
    const tool =
      OPENAI_TOOLS.find(item => item.name === 'setFilesContent');

    assert.notEqual(tool, undefined);

    if (tool === undefined) {
      throw new Error('setFilesContent tool is missing');
    }

    const filesProperty = tool.parameters.properties.files;

    assert.equal(filesProperty?.type, 'array');
    assert.equal(filesProperty?.items?.type, 'object');
    assert.equal(filesProperty?.items?.additionalProperties, false);
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
  'executeToolCall handles startGeneration',
  async () => {
    let called = false;

    const output =
      await executeToolCall(
        {
          type: 'function_call',
          name: 'startGeneration',
          arguments: '{}',
          call_id: 'c_1',
        },
        makeToolsStub({
          startGeneration: async () => {
            called = true;
            return 'queued';
          },
        }),
      );

    assert.equal(called, true);
    assert.equal(output, '{"ok":true,"value":"queued"}');
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

    const tools = makeToolsStub({
      readFile: async path => {
        seenPaths.push(path);
        return `content:${path}`;
      },
    });

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
    const tools = makeToolsStub();

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
    const tools = makeToolsStub({
      readFile: async () => {
        throw new Error('boom');
      },
    });

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
  'executeToolCall handles setFilesContent',
  async () => {
    const seen: Array<{ path: string; content: string }> = [];

    const tools = makeToolsStub({
      setFilesContent: async files => {
        seen.push(...files);
      },
    });

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'setFilesContent',
          arguments: {
            files: [
              { path: 'README.md', content: '# demo' },
              { path: 'app.js', content: 'console.log(1);' },
            ],
          } },
        tools);

    assert.deepEqual(
      seen,
      [
        { path: 'README.md', content: '# demo' },
        { path: 'app.js', content: 'console.log(1);' },
      ],
    );
    assert.equal(output, '{"ok":true,"value":"ok"}');
  });

test(
  'executeToolCall handles readFileData',
  async () => {
    const tools = makeToolsStub({
      readFileData: async path => ({
        mimeType: 'image/png',
        base64: 'AQID',
        dataUrl: `data:image/png;base64:${path === 'assets/logo.png' ? 'AQID' : ''}`,
      }),
    });

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'readFileData',
          arguments: { path: 'assets/logo.png' } },
        tools);

    assert.equal(
      output,
      '{"ok":true,"value":{"mimeType":"image/png","base64":"AQID","dataUrl":"data:image/png;base64:AQID"}}');
  });

test(
  'executeToolCall handles setFileData',
  async () => {
    const calls: Array<Record<string, string>> = [];

    const tools = makeToolsStub({
      setFileData: async (path, mimeType, base64) => {
        calls.push({ path, mimeType, base64 });
      },
    });

    const output =
      await executeToolCall(
        { type: 'function_call',
          name: 'setFileData',
          arguments: {
            path: 'assets/logo.png',
            mimeType: 'image/png',
            base64: 'AQID',
          } },
        tools);

    assert.deepEqual(
      calls,
      [
        {
          path: 'assets/logo.png',
          mimeType: 'image/png',
          base64: 'AQID',
        },
      ]);
    assert.equal(output, '{"ok":true,"value":"ok"}');
  });

test(
  'createAppRuntimeTools readFilesByMask returns bounded matching files',
  async () => {
    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [
          makeFile({ name: 'src/app.js', content: 'alpha beta gamma' }),
          makeFile({ id: 'f2', name: 'src/util.js', content: 'delta epsilon' }),
          makeFile({ id: 'f3', name: 'README.md', content: '# readme' }),
        ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    assert.deepEqual(
      await tools.readFilesByMask('src/*.js', 10, 5),
      {
        'src/app.js': 'alpha\n...[truncated]',
        'src/util.js': 'delta\n...[truncated]',
      },
    );
  });

test(
  'createAppRuntimeTools grep returns matching lines with file and line numbers',
  async () => {
    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [
          makeFile({ name: 'src/app.js', content: 'alpha\nbeta\ngamma' }),
          makeFile({ id: 'f2', name: 'src/util.js', content: 'delta\nbeta util' }),
        ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    assert.deepEqual(
      await tools.grep('src/*.js', 'beta', '', 10),
      [
        { path: 'src/app.js', line: 2, text: 'beta' },
        { path: 'src/util.js', line: 2, text: 'beta util' },
      ],
    );
  });

test(
  'createAppRuntimeTools choose forwards question and options to host UI',
  async () => {
    const seen: Array<{ question: string; options: string[] }> = [];

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
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: (question, options) => {
          seen.push({ question, options });
        },
        wait: async () => undefined,
      });

    await tools.choose('How should it look?', [ 'glowing ring', 'spinning block' ]);

    assert.deepEqual(
      seen,
      [
        {
          question: 'How should it look?',
          options: [ 'glowing ring', 'spinning block' ],
        },
      ],
    );
  });

test(
  'createAppRuntimeTools runAppTests executes JavaScript test modules and reports failures',
  async () => {
    const calls: string[] = [];

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [
          makeFile({
            name: 'app.tests.js',
            content: `export default [
              {
                name: 'first',
                async run({ evalInApp }) {
                  const ok = await evalInApp('window.__testName = "first"; true;');
                  if (!ok) {
                    throw new Error('first should pass');
                  }
                },
              },
              {
                name: 'second',
                async run({ assertInApp }) {
                  await assertInApp('window.__testName = "second"; false;', 'second should pass');
                },
              },
            ];`,
          }),
        ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => {
          calls.push('run');
        },
        evaluateInApp: async code => {
          const currentTest = code.includes('"second"') ? 'second' : 'first';
          calls.push(`eval:${currentTest}`);
          return currentTest === 'first';
        },
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => {
          calls.push('wait');
        },
      });

    const result = await tools.runAppTests();

    assert.deepEqual(calls, [ 'run', 'wait', 'eval:first', 'run', 'wait', 'eval:second' ]);
    assert.equal(result.total, 2);
    assert.equal(result.passed, 1);
    assert.equal(result.failed, 1);
    assert.deepEqual(result.results, [
      { name: 'first', ok: true },
      { name: 'second', ok: false, error: 'second should pass' },
    ]);
  });

test(
  'createAppRuntimeTools runAppTests still supports legacy JSON suites',
  async () => {
    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [
          makeFile({
            name: 'app.tests.json',
            content: JSON.stringify([
              { name: 'legacy', code: 'true;' },
            ]),
          }),
        ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => true,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    const result = await tools.runAppTests('app.tests.json');

    assert.equal(result.path, 'app.tests.json');
    assert.equal(result.passed, 1);
    assert.equal(result.failed, 0);
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
        showChoicePrompt: () => undefined,
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
  'createAppRuntimeTools setFileData stores data url content with normalized path',
  async () => {
    let files: AiToolFileRecord[] = [];

    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => files,
        setFiles: next => {
          files = next;
        },
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'image-file-id',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    await tools.setFileData(
      './assets\\logo.png',
      'image/png',
      'AQID',
    );

    assert.equal(files.length, 1);
    assert.equal(files[0].name, 'assets/logo.png');
    assert.equal(files[0].content, 'data:image/png;base64,AQID');
  });

test(
  'createAppRuntimeTools readFileData returns parsed file data for data urls',
  async () => {
    const tools =
      createAppRuntimeTools({
        getCurrentAppId: () => 'app-1',
        getFiles: () => [
          makeFile({
            name: 'assets/logo.png',
            content: 'data:image/png;base64,AQID',
          }),
        ],
        setFiles: () => undefined,
        getActiveFileName: () => null,
        setActiveFileName: () => undefined,
        createFileId: () => 'unused',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    assert.deepEqual(
      await tools.readFileData('assets/logo.png'),
      {
        mimeType: 'image/png',
        base64: 'AQID',
        dataUrl: 'data:image/png;base64,AQID',
      },
    );
  });

test(
  'createAppRuntimeTools setFileContent activates dotfiles like any other file',
  async () => {
    let files: AiToolFileRecord[] = [];
    let activeFileName: string | null = 'README.md';

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
        createFileId: () => 'new-hidden-file-id',
        saveFile: async () => undefined,
        deleteFileById: async () => undefined,
        runApp: () => undefined,
        evaluateInApp: async () => null,
        getAppDiagnostics: async () => null,
        showChoicePrompt: () => undefined,
        wait: async () => undefined,
      });

    await tools.setFileContent('.README.md', '# previous');

    assert.equal(files.length, 1);
    assert.equal(files[0].name, '.README.md');
    assert.equal(activeFileName, '.README.md');
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
        showChoicePrompt: () => undefined,
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
        showChoicePrompt: () => undefined,
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
        showChoicePrompt: () => undefined,
        wait: async milliseconds => {
          calls.push(`wait:${milliseconds}`);
        },
        diagnosticsDelayMs: 123,
      });

    const result = await tools.runAppAndCollectDiagnostics();

    assert.deepEqual(calls, [ 'run', 'wait:123', 'diag' ]);
    assert.deepEqual(result, { ok: true });
  });
