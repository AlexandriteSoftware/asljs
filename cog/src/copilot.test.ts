import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { CopilotAcpService,
         type CopilotService }
  from './copilot.js';
import { SingletonServiceProvider }
  from './service.js';
import { type CopilotAcpTool }
  from './tools/copilot.js';

test(
  'copilot service is reused across requests',
  async () =>
  {
    let created = 0;

    const provider =
      new SingletonServiceProvider();

    provider.register<CopilotService>(
      'copilot',
      () =>
      {
        created++;

        return { complete(
            request
          ): Promise<{ content: string; }>
          {
            return Promise.resolve(
              { content: request.prompt });
          } };
      }
    );

    const service =
      await provider.get<CopilotService>(
      'copilot'
    );

    assert.equal(
      (await service.complete(
        { prompt: 'first' })).content,
      'first');

    assert.equal(
      (await (await provider.get<CopilotService>(
        'copilot'
      )).complete(
        { prompt: 'second' })).content,
      'second');

    assert.equal(
      created,
      1);
  });

test(
  'CopilotAcpService starts the tool once and forwards prompts',
  async () =>
  {
    const calls: string[] = [ ];

    const tool =
      { start(): Promise<void>
      {
        calls.push(
          'start');

        return Promise.resolve();
      },
        prompt(
        text: string
      ): Promise<string>
      {
        calls.push(
          `prompt:${text}`);

        return Promise.resolve(
          `reply to ${text}`);
      },
        stop(): Promise<void>
      {
        calls.push(
          'stop');

        return Promise.resolve();
      } } as unknown as CopilotAcpTool;

    const service =
      new CopilotAcpService(
        tool);

    assert.equal(
      (await service.complete(
        { prompt: 'first' })).content,
      'reply to first');

    assert.equal(
      (await service.complete(
        { prompt: 'second' })).content,
      'reply to second');

    await service.dispose();

    assert.deepEqual(
      calls,
      [ 'start',
        'prompt:first',
        'prompt:second',
        'stop' ]);
  });

test(
  'CopilotAcpService dispose is a no-op when never started',
  async () =>
  {
    const calls: string[] = [ ];

    const tool =
      { start(): Promise<void>
      {
        calls.push(
          'start');

        return Promise.resolve();
      },
        stop(): Promise<void>
      {
        calls.push(
          'stop');

        return Promise.resolve();
      } } as unknown as CopilotAcpTool;

    await new CopilotAcpService(
      tool)
      .dispose();

    assert.deepEqual(
      calls,
      [ ]);
  });

test(
  'CopilotAcpService adds request files to the prompt',
  async () =>
  {
    let prompt = '';

    const tool =
      { start(): Promise<void>
      {
        return Promise.resolve();
      },
        prompt(
        text: string
      ): Promise<string>
      {
        prompt = text;

        return Promise.resolve(
          'done');
      },
        stop(): Promise<void>
      {
        return Promise.resolve();
      } } as unknown as CopilotAcpTool;

    const service =
      new CopilotAcpService(
        tool);

    await service.complete(
      { prompt: 'Review this.',
        files:
          [ { path: 'src/app.ts',
              type: 'text',
              content: 'const value = 1;' } ] });

    assert.match(
      prompt,
      /Review this\./);

    assert.match(
      prompt,
      /File: src\/app\.ts/);

    assert.match(
      prompt,
      /const value = 1;/);
  });
