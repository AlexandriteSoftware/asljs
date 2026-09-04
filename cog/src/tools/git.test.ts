import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { GitTool,
         parsePorcelainStatus,
         parseUntrackedFiles }
  from './git.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

function recordingRunner(
    results: readonly CommandResult[]
  ): { runner: CommandRunner; calls: string[][]; }
{
  const calls: string[][] = [ ];

  return { calls,
           runner:
             { run(
        command,
        arguments_
      ): Promise<CommandResult>
      {
        calls.push(
          [ command,
            ...arguments_ ]);

        return Promise.resolve(
          results[calls.length - 1]
            ?? { exitCode: 0,
                 stdout: '',
                 stderr: '' });
      } } };
}

test(
  'git tool returns modified, renamed, and untracked files',
  async () =>
  {
    const runner: CommandRunner =
      { run(): Promise<{
        exitCode: number;
        stdout: string;
        stderr: string;
      }>
      {
        return Promise.resolve(
          { exitCode: 0,
            stdout:
              ' M src/changed.ts\0?? docs/new.md\0R  src/new.cs\0src/old.cs\0',
            stderr: '' });
      } };

    const tool =
      new GitTool(
        runner);

    assert.deepEqual(
      await tool.getChangedFiles(
        'repo'),
      [ 'src/changed.ts',
        'docs/new.md',
        'src/new.cs' ]);
  });

test(
  'porcelain parser removes duplicate paths',
  () =>
  {
    assert.deepEqual(
      parsePorcelainStatus(
        'M  file.ts\0 M file.ts\0'),
      [ 'file.ts' ]);
  });

test(
  'untracked parser only keeps ?? entries',
  () =>
  {
    assert.deepEqual(
      parseUntrackedFiles(
        ' M src/changed.ts\0?? docs/new.md\0?? src/new.ts\0'),
      [ 'docs/new.md',
        'src/new.ts' ]);
  });

test(
  'isRepository returns true when git reports inside a work tree',
  async () =>
  {
    const { runner } =
      recordingRunner(
        [ { exitCode: 0,
            stdout: 'true\n',
            stderr: '' } ]);

    assert.equal(
      await new GitTool(
        runner)
        .isRepository(
          'repo'),
      true);
  });

test(
  'isRepository returns false when git fails',
  async () =>
  {
    const { runner } =
      recordingRunner(
        [ { exitCode: 128,
            stdout: '',
            stderr:
              'fatal: not a git repository' } ]);

    assert.equal(
      await new GitTool(
        runner)
        .isRepository(
          'repo'),
      false);
  });

test(
  'getDiff returns diff output against HEAD',
  async () =>
  {
    const { runner, calls } =
      recordingRunner(
        [ { exitCode: 0,
            stdout:
              'diff --git a/file b/file\n',
            stderr: '' } ]);

    assert.equal(
      await new GitTool(
        runner)
        .getDiff(
          'repo'),
      'diff --git a/file b/file\n');

    assert.deepEqual(
      calls[0],
      [ 'git',
        'diff',
        'HEAD' ]);
  });

test(
  'getDiff throws when git fails',
  async () =>
  {
    const { runner } =
      recordingRunner(
        [ { exitCode: 1,
            stdout: '',
            stderr: 'bad revision' } ]);

    await assert.rejects(
      () =>
        new GitTool(
          runner)
          .getDiff(
            'repo'));
  });

test(
  'commit stages all changes then commits with the message',
  async () =>
  {
    const { runner, calls } =
      recordingRunner(
        [ { exitCode: 0,
            stdout: '',
            stderr: '' },
          { exitCode: 0,
            stdout: '',
            stderr: '' } ]);

    await new GitTool(
      runner)
      .commit(
        'repo',
        'summary');

    assert.deepEqual(
      calls,
      [ [ 'git',
          'add',
          '-A' ],
        [ 'git',
          'commit',
          '-m',
          'summary' ] ]);
  });

test(
  'commit throws when staging fails',
  async () =>
  {
    const { runner } =
      recordingRunner(
        [ { exitCode: 1,
            stdout: '',
            stderr: 'add failed' } ]);

    await assert.rejects(
      () =>
        new GitTool(
          runner)
          .commit(
            'repo',
            'summary'));
  });

test(
  'commit throws when the commit command fails',
  async () =>
  {
    const { runner } =
      recordingRunner(
        [ { exitCode: 0,
            stdout: '',
            stderr: '' },
          { exitCode: 1,
            stdout: '',
            stderr: 'nothing to commit' } ]);

    await assert.rejects(
      () =>
        new GitTool(
          runner)
          .commit(
            'repo',
            'summary'));
  });

test(
  'discardAllChanges checks out tracked files then removes untracked ones',
  async () =>
  {
    const { runner, calls } =
      recordingRunner(
        [ { exitCode: 0,
            stdout: '',
            stderr: '' },
          { exitCode: 0,
            stdout: '',
            stderr: '' } ]);

    await new GitTool(
      runner)
      .discardAllChanges(
        'repo');

    assert.deepEqual(
      calls,
      [ [ 'git',
          'checkout',
          '--',
          '.' ],
        [ 'git',
          'clean',
          '-fd' ] ]);
  });
