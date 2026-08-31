import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from '../logger.js';
import { NodeCommandRunner }
  from './node-command-runner.js';
import { NpmCliTool,
         resolveNpmCommand }
  from './npm.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

test(
  'npm tool runs build and test scripts',
  async () =>
  {
    const calls: unknown[] = [ ];

    const runner: CommandRunner =
      { run(
        command,
        arguments_,
        workingDirectory
      ): Promise<CommandResult>
      {
        calls.push(
          { command,
            arguments_,
            workingDirectory });

        return Promise.resolve(
          { exitCode: 0,
            stdout: '',
            stderr: '' });
      } };

    const tool =
      new NpmCliTool(
        runner);

    await tool.build(
      'repo');

    await tool.test(
      'repo',
      { arguments:
          [ '--watch=false' ] });

    const { command,
            prefixArguments } =
      resolveNpmCommand();

    assert.deepEqual(
      calls,
      [ { command,
          arguments_:
            [ ...prefixArguments,
              'run',
              'build' ],
          workingDirectory: 'repo' },
        { command,
          arguments_:
            [ ...prefixArguments,
              'run',
              'test',
              '--watch=false' ],
          workingDirectory: 'repo' } ]);
  });

test(
  'npm tool throws with combined output when the script fails',
  async () =>
  {
    const runner: CommandRunner =
      { run(): Promise<CommandResult>
      {
        return Promise.resolve(
          { exitCode: 1,
            stdout: 'compiling...',
            stderr: 'error TS1: broken' });
      } };

    await assert.rejects(
      () =>
        new NpmCliTool(
          runner)
          .build(
            'repo'),
      /compiling\.\.\.[\s\S]*error TS1: broken/);
  });

test(
  'resolveNpmCommand runs npm through cmd.exe /c on Windows only',
  () =>
  {
    const resolved =
      resolveNpmCommand();

    if (process.platform === 'win32') {
      assert.equal(
        resolved.command,
        'cmd.exe');

      assert.deepEqual(
        resolved.prefixArguments,
        [ '/d',
          '/s',
          '/c',
          'npm' ]);
    } else {
      assert.equal(
        resolved.command,
        'npm');

      assert.deepEqual(
        resolved.prefixArguments,
        [ ]);
    }
  });

test(
  'npm tool runs a real npm script end-to-end without ENOENT or EINVAL',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'npm.test'));

    await workspace.writeText(
      'package.json',
      JSON.stringify(
        { name: 'fixture',
          version: '0.0.0',
          scripts:
            { build: 'node build.js' } }));

    await workspace.writeText(
      'build.js',
      'process.exit(0);');

    await new NpmCliTool(
      new NodeCommandRunner())
      .build(
        workspace.path);
  });
