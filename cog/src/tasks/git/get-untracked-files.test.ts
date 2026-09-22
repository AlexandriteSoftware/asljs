import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../../context.js';
import { SingletonServiceProvider }
  from '../../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../../task.js';
import { GetUntrackedFilesTask }
  from './get-untracked-files.js';
import { GitTool }
  from './git.js';

test(
  'get untracked files task uses Git task category adapter',
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
              stdout:
                ' M tracked.ts\0?? new.ts\0',
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
        new GetUntrackedFilesTask(
          { workingDirectory: 'repo' })),
      [ 'new.ts' ]);
  });
