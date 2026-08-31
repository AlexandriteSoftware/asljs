import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { Context }
  from '../context.js';
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
import { CleanWorkingFolderTask }
  from './clean-working-folder.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

test(
  'clean-working-folder writes a backup then discards local changes',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'clean-working-folder.test'));

    await workspace.writeText(
      'new-file.txt',
      'new content');

    const calls: string[][] = [ ];

    const runner: CommandRunner =
      { run(
          _command,
          arguments_
        ): Promise<CommandResult>
      {
        calls.push(
          [ ...arguments_ ]);

        if (arguments_[0] === 'diff') {
          return Promise.resolve(
            { exitCode: 0,
              stdout:
                'diff --git a/x b/x\n',
              stderr: '' });
        }

        if (arguments_[0] === 'status') {
          return Promise.resolve(
            { exitCode: 0,
              stdout: '?? new-file.txt\0',
              stderr: '' });
        }

        return Promise.resolve(
          { exitCode: 0,
            stdout: '',
            stderr: '' });
      } };

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
                  runner) ] ] });

    const backupPath =
      await context.run(
        new CleanWorkingFolderTask(
          { workingDirectory: workspace.path }));

    assert.match(
      path.basename(
        backupPath),
      /^clean\..+\.bak$/);

    const backup =
      JSON.parse(
        await fs.readFile(
          backupPath,
          'utf8')) as {
      diff: string;
      untrackedFiles: { path: string; contentBase64: string; }[];
    };

    assert.equal(
      backup.diff,
      'diff --git a/x b/x\n');

    assert.deepEqual(
      backup.untrackedFiles,
      [ { path: 'new-file.txt',
          contentBase64:
            Buffer.from(
              'new content')
              .toString(
                'base64') } ]);

    assert.deepEqual(
      calls.at(-2),
      [ 'checkout',
        '--',
        '.' ]);

    assert.deepEqual(
      calls.at(-1),
      [ 'clean',
        '-fd' ]);
  });
