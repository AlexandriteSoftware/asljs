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
import { GitTool }
  from '../tools/git.js';
import { GetChangedFilesTask }
  from './get-changed-files.js';

test(
  'get changed files task uses Git tool',
  async () =>
  {
    const git =
      new GitTool(
        { run(): Promise<{
          exitCode: number;
          stdout: string;
          stderr: string;
        }>
        {
          return Promise.resolve(
            { exitCode: 0,
              stdout: '?? file.ts\0',
              stderr: '' });
        } });

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          tools:
            [ [ git.name,
                git ] ] });

    assert.deepEqual(
      await context.run(
        new GetChangedFilesTask(
          { workingDirectory: 'repo' })),
      [ 'file.ts' ]);
  });
