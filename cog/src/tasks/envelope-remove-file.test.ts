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
import { EnvelopeRemoveFileTask }
  from './envelope-remove-file.js';

test(
  'envelope-remove-file task delegates to the envelope tool',
  async () =>
  {
    const calls: unknown[] = [ ];

    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    const envelopeTool =
      { name: 'envelope',
        removeFile(
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
      new EnvelopeRemoveFileTask(
        { command: 'remove',
          path: 'file.txt' }));

    assert.deepEqual(
      calls,
      [ [ envelope,
          { command: 'remove',
            path: 'file.txt' },
          undefined ] ]);
  });
