import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { type CopilotAcpTool }
  from '../tools/copilot.js';
import { CopilotCheckTask }
  from './copilot-check.js';

interface StubCalls
{
  started: number;
  stopped: number;
  prompts: string[];
}

function createContext(
    calls: StubCalls,
    respond: (
    prompt: string
  ) => string
  ): Context
{
  const copilot =
    { name: 'copilot',
      sessionId: 'stub-session',
      start(): Promise<void>
    {
      calls.started++;

      return Promise.resolve();
    },
      prompt(
      text: string
    ): Promise<string>
    {
      calls.prompts.push(
        text);

      return Promise.resolve(
        respond(text));
    },
      stop(): Promise<void>
    {
      calls.stopped++;

      return Promise.resolve();
    } } as unknown as CopilotAcpTool;

  return new Context(
    { taskFactory:
        new TaskRegistry(),
      taskRunner:
        new DefaultTaskRunner(),
      serviceProvider:
        new SingletonServiceProvider(),
      tools:
        [ [ 'copilot',
            copilot ] ] });
}

test(
  'copilot-check sends two prompts and stops the server',
  async () =>
  {
    const calls: StubCalls =
      { started: 0,
        stopped: 0,
        prompts: [ ] };

    const context =
      createContext(
        calls,
        prompt => `answer to ${prompt}`);

    const result =
      await context.run(
        new CopilotCheckTask());

    assert.deepEqual(
      calls.prompts,
      [ 'Reply with exactly: PING',
        'Reply with exactly: PONG' ]);

    assert.deepEqual(
      result.responses,
      [ 'answer to Reply with exactly: PING',
        'answer to Reply with exactly: PONG' ]);

    assert.equal(
      result.sessionId,
      'stub-session');

    assert.equal(
      calls.started,
      1);

    assert.equal(
      calls.stopped,
      1);
  });

test(
  'copilot-check fails on an empty response and still stops the server',
  async () =>
  {
    const calls: StubCalls =
      { started: 0,
        stopped: 0,
        prompts: [ ] };

    const context =
      createContext(
        calls,
        () => '   ');

    await assert.rejects(
      context.run(
        new CopilotCheckTask(
          { prompts:
              [ 'only' ] })),
      /empty response/);

    assert.equal(
      calls.stopped,
      1);
  });
