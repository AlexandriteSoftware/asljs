import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { DotnetCliTool }
  from './dotnet.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

test(
  'dotnet tool supports build and test',
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
      new DotnetCliTool(
        runner);

    await tool.build(
      'repo',
      { target: 'App.sln',
        arguments:
          [ '--configuration',
            'Release' ] });

    await tool.test(
      'repo',
      { target: 'App.Tests.csproj' });

    assert.deepEqual(
      calls,
      [ { command: 'dotnet',
          arguments_:
            [ 'build',
              'App.sln',
              '--configuration',
              'Release' ],
          workingDirectory: 'repo' },
        { command: 'dotnet',
          arguments_:
            [ 'test',
              'App.Tests.csproj' ],
          workingDirectory: 'repo' } ]);
  });
