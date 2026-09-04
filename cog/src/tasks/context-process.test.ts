import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { type CopilotResponse }
  from '../copilot.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { ContextProcessTask }
  from './context-process.js';

test(
  'context-process task sends context through the copilot task',
  async () =>
  {
    const prompts: string[] = [ ];

    const registry =
      new TaskRegistry();

    registry.register(
      'copilot',
      parameters => ({ run(): Promise<CopilotResponse>
        {
          prompts.push(
            JSON.stringify(
              parameters));

          return Promise.resolve(
            { content: 'done' });
        } }));

    const context =
      new Context(
        { instruction: 'Fix the bug.',
          task:
            'Address the failing test.',
          files:
            [ { path: 'src/code.ts',
                type: 'text',
                content: 'const x = 1;' },
              { path: 'image.png',
                type: 'binary',
                complete: false } ],
          taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider() });

    const response =
      await context.run(
        new ContextProcessTask());

    assert.deepEqual(
      response,
      { content: 'done' });

    assert.equal(
      prompts.length,
      1);

    assert.match(
      prompts[0],
      /Fix the bug\./);

    assert.match(
      prompts[0],
      /Address the failing test\./);

    assert.match(
      prompts[0],
      /"path":"src\/code\.ts"/);

    assert.match(
      prompts[0],
      /"content":"const x = 1;"/);

    assert.match(
      prompts[0],
      /"path":"image\.png"/);
  });
