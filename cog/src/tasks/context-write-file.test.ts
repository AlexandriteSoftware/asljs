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
import { ContextWriteFileTask }
  from './context-write-file.js';

test(
  'context-write-file task writes through the context task',
  async () =>
  {
    await using workspace =
      new TmpDir();

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          files: [ ] });

    await context.run(
      new ContextWriteFileTask(
        { path:
            workspace.resolve('file.txt'),
          content: 'content' }));

    assert.equal(
      await workspace.readText('file.txt'),
      'content');
  });
