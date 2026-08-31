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
import { CommitIfChangedTask }
  from './commit-if-changed.js';

function statusRunner(
    stdout: string
  ): CommandRunner
{
  return { run(): Promise<CommandResult>
    {
      return Promise.resolve(
        { exitCode: 0,
          stdout,
          stderr: '' });
    } };
}

test(
  'commit-if-changed does nothing when there are no changes',
  async () =>
  {
    const registry =
      new TaskRegistry();

    registry.register(
      'commit',
      () => ({ run(): Promise<string>
        {
          throw new Error(
            'commit should not run');
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
                  statusRunner(
                    '')) ] ] });

    assert.equal(
      await context.run(
        new CommitIfChangedTask(
          { workingDirectory: 'repo' })),
      null);
  });

test(
  'commit-if-changed commits when there are changes',
  async () =>
  {
    const registry =
      new TaskRegistry();

    registry.register(
      'commit',
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
                  statusRunner(
                    '?? file.ts\0')) ] ] });

    assert.equal(
      await context.run(
        new CommitIfChangedTask(
          { workingDirectory: 'repo' })),
      'Fix bug');
  });
