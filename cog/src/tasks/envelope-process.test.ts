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
import { envelopeData }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeProcessTask }
  from './envelope-process.js';

test(
  'envelope-process task sends the envelope content through the copilot task',
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
            (parameters as { prompt: string; }).prompt);

          return Promise.resolve(
            { content: 'done' });
        } }));

    const envelope: Envelope =
      { instruction: 'Fix the bug.',
        task:
          'Address the failing test.',
        files:
          [ { path: 'src/code.ts',
              type: 'text',
              content: 'const x = 1;' },
            { path: 'image.png',
              type: 'binary',
              complete: false } ] };

    const context =
      new Context(
        { taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          data:
            [ [ envelopeData,
                envelope ] ] });

    const response =
      await context.run(
        new EnvelopeProcessTask());

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
      /File: src\/code\.ts/);

    assert.match(
      prompts[0],
      /const x = 1;/);

    assert.match(
      prompts[0],
      /File: image\.png \(partial\)/);

    assert.match(
      prompts[0],
      /\(binary content omitted\)/);
  });
