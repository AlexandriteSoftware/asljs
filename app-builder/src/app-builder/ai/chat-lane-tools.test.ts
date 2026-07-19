import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { AiTools }
  from './ai-tools.js';
import { createChatLaneTools }
  from './chat-lane-tools.js';

function makeBaseTools(
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
      results: []
    }),
    startGeneration: async () => 'queued',
    getAppDiagnostics: async () => null,
    runAppAndCollectDiagnostics: async () => null
  };
}

test(
  'createChatLaneTools only allows PLAN.md writes',
  async () =>
  {
    const chatTools =
      createChatLaneTools(
        makeBaseTools(),
        {
        planFileName: 'PLAN.md',
        startGeneration: async () => 'queued'
      });

    await assert.rejects(
      () =>
        chatTools.setFileContent(
          'app.js',
          'console.log(1);'
        ),
      /only edit PLAN\.md/i
    );
  }
);

test(
  'createChatLaneTools forwards startGeneration',
  async () =>
  {
    let called = false;

    const chatTools =
      createChatLaneTools(
        makeBaseTools(),
        {
        planFileName: 'PLAN.md',
        startGeneration: async () =>
        {
          called = true;
          return 'queued';
        }
      });

    const result =
      await chatTools.startGeneration();

    assert.equal(
      called,
      true
    );

    assert.equal(
      result,
      'queued'
    );
  }
);
