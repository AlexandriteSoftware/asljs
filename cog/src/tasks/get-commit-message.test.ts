import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { type CopilotService }
  from '../copilot.js';
import { createLoggerProvider }
  from '../logger.js';
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
import { GetCommitMessageTask }
  from './get-commit-message.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

function commandRunner(
    results: Record<string, CommandResult>
  ): CommandRunner
{
  return { run(
      _command,
      arguments_
    ): Promise<CommandResult>
    {
      const key = arguments_[0];

      return Promise.resolve(
        results[key]
          ?? { exitCode: 0,
               stdout: '',
               stderr: '' });
    } };
}

test(
  'get-commit-message stops when the folder is not a git repository',
  async () =>
  {
    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          tools:
            [ [ 'git',
                new GitTool(
                  commandRunner(
                    { 'rev-parse':
                        { exitCode: 128,
                          stdout: '',
                          stderr:
                            'fatal: not a git repository' } })) ] ] });

    await assert.rejects(
      () =>
        context.run(
          new GetCommitMessageTask(
            { workingDirectory: 'repo' })),
      /stop:/);
  });

test(
  'get-commit-message sends the diff and untracked files to Copilot',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'get-commit-message.test'));

    await workspace.writeText(
      'new-file.txt',
      'new content');

    const prompts: string[] = [ ];

    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(
          request
        ): Promise<{ content: string; }>
        {
          prompts.push(
            request.prompt);

          return Promise.resolve(
            { content: 'Add new file\n' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services,
          tools:
            [ [ 'git',
                new GitTool(
                  commandRunner(
                    { 'rev-parse':
                        { exitCode: 0,
                          stdout: 'true\n',
                          stderr: '' },
                      diff:
                        { exitCode: 0,
                          stdout:
                            'diff --git a/x b/x\n',
                          stderr: '' },
                      status:
                        { exitCode: 0,
                          stdout: '?? new-file.txt\0',
                          stderr: '' } })) ] ] });

    const message =
      await context.run(
        new GetCommitMessageTask(
          { workingDirectory: workspace.path }));

    assert.equal(
      message,
      'Add new file');

    assert.equal(
      prompts.length,
      1);

    assert.match(
      prompts[0],
      /diff --git a\/x b\/x/);

    assert.match(
      prompts[0],
      /New file: new-file.txt/);

    assert.match(
      prompts[0],
      /new content/);
  });
