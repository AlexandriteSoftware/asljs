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
         type EnvelopeTool,
         rollbackFeedData }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeAddFilesTask }
  from './envelope-add-files.js';

test(
  'envelope-add-files task delegates to the envelope tool',
  async () =>
  {
    const calls: unknown[] = [ ];

    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    const rollbackFeed =
      { feed: true };

    const envelopeTool =
      { name: 'envelope',
        addFiles(
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
                envelope ],
              [ rollbackFeedData,
                rollbackFeed ] ],
          tools:
            [ [ 'envelope',
                envelopeTool ] ] });

    await context.run(
      new EnvelopeAddFilesTask(
        { command: 'read',
          pattern: '*.txt' }));

    assert.deepEqual(
      calls,
      [ [ envelope,
          { command: 'read',
            pattern: '*.txt' },
          rollbackFeed ] ]);
  });
