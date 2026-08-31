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
import { envelopeData,
         type EnvelopeTool }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeWriteFileTask }
  from './envelope-write-file.js';

test(
  'envelope-write-file task delegates to the envelope tool',
  async () =>
  {
    const calls: unknown[] = [ ];

    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    const envelopeTool =
      { name: 'envelope',
        writeFile(
        ...args: unknown[]
      ): Promise<void>
      {
        calls.push(
          args);

        return Promise.resolve();
      } } as unknown as EnvelopeTool;

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          data:
            [ [ envelopeData,
                envelope ] ],
          tools:
            [ [ 'envelope',
                envelopeTool ] ] });

    await context.run(
      new EnvelopeWriteFileTask(
        { command: 'write',
          path: 'file.txt',
          content: 'content' }));

    assert.deepEqual(
      calls,
      [ [ envelope,
          { command: 'write',
            path: 'file.txt',
            content: 'content' },
          undefined ] ]);
  });
