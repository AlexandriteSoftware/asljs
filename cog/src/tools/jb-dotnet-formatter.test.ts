import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { JbDotnetFormatterTool }
  from './jb-dotnet-formatter.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

test(
  'JetBrains formatter scopes cleanupcode to C# files',
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
      new JbDotnetFormatterTool(
        runner);

    await tool.format(
      process.cwd(),
      { target: 'App.sln',
        files:
          [ 'src/One.cs',
            'src/Two.cs' ],
        profile:
          'Built-in: Full Cleanup' });

    assert.deepEqual(
      calls,
      [ { command: 'jb',
          arguments_:
            [ 'cleanupcode',
              '--include=src/One.cs;src/Two.cs',
              '--profile=Built-in: Full Cleanup',
              'App.sln' ],
          workingDirectory:
            process.cwd() } ]);
  });
