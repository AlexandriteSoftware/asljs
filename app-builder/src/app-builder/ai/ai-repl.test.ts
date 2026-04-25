import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  type AiTools,
  type ResponseFunctionCallOutput,
} from './ai-tools.js';
import {
  generateApp,
  type AiResponsesTransport,
  DEFAULT_MODEL,
} from './ai-repl.js';

const TEST_TOOLS: AiTools =
  { listFileset: async () => [ 'index.html' ],
    listFilesByMask: async () => [ 'index.html' ],
    readFile: async () => 'content',
    readFiles: async () => ({ 'index.html': 'content' }),
    readFilesByMask: async () => ({ 'index.html': 'content' }),
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
      path: 'app.tests.json',
      total: 0,
      passed: 0,
      failed: 0,
      results: [],
    }),
    getAppDiagnostics: async () => null,
    runAppAndCollectDiagnostics: async () => null };

test(
  'generateApp returns output_text summary with injected transport',
  async () => {
    const requests: unknown[] = [];

    const transport: AiResponsesTransport =
      { createResponse: async request => {
          requests.push(request);

          return {
            id: 'resp-1',
            output_text: 'Completed summary',
            output: [],
          };
        } };

    const result =
      await generateApp(
        'Build app',
        'test-key',
        DEFAULT_MODEL,
        TEST_TOOLS,
        { transport });

    assert.equal(result.summary, 'Completed summary');
    assert.equal(requests.length, 1);
  });

test(
  'generateApp executes tool calls and sends function_call_output via transport',
  async () => {
    const requests: Array<Record<string, unknown>> = [];
    let callCount = 0;

    const transport: AiResponsesTransport =
      { createResponse: async request => {
          requests.push(request as Record<string, unknown>);
          callCount += 1;

          if (callCount === 1) {
            return {
              id: 'resp-1',
              output: [
                {
                  type: 'function_call',
                  name: 'listFileset',
                  call_id: 'call-1',
                  arguments: '{}',
                },
              ],
            };
          }

          const toolOutputs =
            request.input as ResponseFunctionCallOutput[];

          assert.equal(Array.isArray(toolOutputs), true);
          assert.equal(toolOutputs[0]?.type, 'function_call_output');
          assert.equal(toolOutputs[0]?.call_id, 'call-1');
          assert.equal(
            toolOutputs[0]?.output,
            '{"ok":true,"value":["index.html"]}');

          return {
            output: [
              {
                type: 'message',
                role: 'assistant',
                content: [
                  {
                    type: 'output_text',
                    text: 'Applied update.',
                  },
                ],
              },
            ],
          };
        } };

    const result =
      await generateApp(
        'List files and confirm',
        'test-key',
        DEFAULT_MODEL,
        TEST_TOOLS,
        { transport });

    assert.equal(result.summary, 'Applied update.');
    assert.equal(callCount, 2);
    assert.equal(requests[0]?.previous_response_id, undefined);
    assert.equal(requests[1]?.previous_response_id, 'resp-1');
  });

test(
  'generateApp propagates transport errors',
  async () => {
    const transport: AiResponsesTransport =
      { createResponse: async () => {
          throw new Error('Transport failed');
        } };

    await assert.rejects(
      () => generateApp(
        'Do work',
        'test-key',
        DEFAULT_MODEL,
        TEST_TOOLS,
        { transport }),
      /Transport failed/);
  });

test(
  'generateApp extends tool step limit when approved',
  async () => {
    let onToolStepLimitCalls = 0;
    let transportCalls = 0;

    const transport: AiResponsesTransport =
      { createResponse: async () => {
          transportCalls += 1;

          if (transportCalls <= 2) {
            return {
              id: `resp-${transportCalls}`,
              output: [
                {
                  type: 'function_call',
                  name: 'listFileset',
                  call_id: `call-${transportCalls}`,
                  arguments: {},
                },
              ],
            };
          }

          return {
            output_text: 'done',
            output: [],
          };
        } };

    const result =
      await generateApp(
        'Do work',
        'test-key',
        DEFAULT_MODEL,
        TEST_TOOLS,
        {
          initialToolStepLimit: 1,
          onToolStepLimit: async () => {
            onToolStepLimitCalls += 1;
            return true;
          },
          transport,
        });

    assert.equal(result.summary, 'done');
    assert.equal(onToolStepLimitCalls, 1);
  });
