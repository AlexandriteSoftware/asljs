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
import { ContextAddFilesTask }
  from './context-add-files.js';

test(
  'context-add-files task adds files to context',
  async () =>
  {
    await using workspace =
      new TmpDir();

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
          files: [ ] });

    await context.run(
      new ContextAddFilesTask(
        { pattern:
            workspace.resolve(
              'file.txt'),
          readToEnd: true }));

    assert.equal(
      context.files[0].content,
      'content');
  });
