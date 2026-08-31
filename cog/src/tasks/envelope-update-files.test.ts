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
         EnvelopeTool }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeUpdateFilesTask }
  from './envelope-update-files.js';

test(
  'envelope-update-files task runs an add-files task for every stored update',
  async () =>
  {
    const commands: unknown[] = [ ];

    const registry =
      new TaskRegistry();

    registry.register(
      'envelope-add-files',
      parameters => ({ run(): Promise<void>
        {
          commands.push(
            parameters);

          return Promise.resolve();
        } }));

    const envelope: Envelope =
      { instruction: '',
        files:
          [ { path: 'one.txt',
              type: 'text',
              update:
                { command: 'read',
                  pattern: 'one.txt' } },
            { path: 'two.txt',
              type: 'text' } ] };

    const context =
      new Context(
        { taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          data:
            [ [ envelopeData,
                envelope ] ],
          tools:
            [ [ 'envelope',
                new EnvelopeTool() ] ] });

    await context.run(
      new EnvelopeUpdateFilesTask());

    assert.deepEqual(
      commands,
      [ { command: 'read',
          pattern: 'one.txt' } ]);
  });
