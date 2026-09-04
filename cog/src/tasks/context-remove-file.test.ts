import { TmpDir }
  from 'asljs-tmpdir';
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
import { ContextRemoveFileTask }
  from './context-remove-file.js';

test(
  'context-remove-file task removes a context file',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const filePath =
      workspace.resolve('file.txt');

    await workspace.writeText(
      'file.txt',
      'content');

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          files:
            [ { path: filePath,
                type: 'text' } ] });

    await context.run(
      new ContextRemoveFileTask(
        { path: filePath }));

    assert.deepEqual(
      context.files,
      [ ]);
  });
