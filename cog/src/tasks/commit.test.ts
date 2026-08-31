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
import { type CommandResult,
         type CommandRunner }
  from '../tools/tool.js';
import { CommitTask }
  from './commit.js';

test(
  'commit task gets a commit message then commits with it',
  async () =>
  {
    const calls: string[][] = [ ];

    const runner: CommandRunner =
      { run(
          _command,
          arguments_
        ): Promise<CommandResult>
      {
        calls.push(
          [ ...arguments_ ]);

        return Promise.resolve(
          { exitCode: 0,
            stdout: '',
            stderr: '' });
      } };

    const registry =
      new TaskRegistry();

    registry.register(
      'get-commit-message',
      () => ({ run(): Promise<string>
        {
          return Promise.resolve(
            'Fix bug');
        } }));

    const context =
      new Context(
        { taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          tools:
            [ [ 'git',
                new GitTool(
                  runner) ] ] });

    const message =
      await context.run(
        new CommitTask(
          { workingDirectory: 'repo' }));

    assert.equal(
      message,
      'Fix bug');

    assert.deepEqual(
      calls,
      [ [ 'add',
          '-A' ],
        [ 'commit',
          '-m',
          'Fix bug' ] ]);
  });
