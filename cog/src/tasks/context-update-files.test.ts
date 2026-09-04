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
import { ContextUpdateFilesTask }
  from './context-update-files.js';

test(
  'context-update-files task runs an add-files task for every stored update',
  async () =>
  {
    const commands: unknown[] = [ ];

    const registry =
      new TaskRegistry();

    registry.register(
      'context-add-files',
      parameters => ({ run(): Promise<void>
        {
          commands.push(
            parameters);

          return Promise.resolve();
        } }));

    const context =
      new Context(
        { files:
            [ { path: 'one.txt',
                type: 'text',
                update:
                  { command: 'read',
                    pattern: 'one.txt' } },
              { path: 'two.txt',
                type: 'text' } ],
          taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider() });

    await context.run(
      new ContextUpdateFilesTask());

    assert.deepEqual(
      commands,
      [ { command: 'read',
          pattern: 'one.txt' } ]);
  });
