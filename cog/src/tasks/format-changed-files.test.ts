import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
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
import { AsljsFormatterTool }
  from '../tools/asljs-formatter.js';
import { DprintFormatterTool }
  from '../tools/dprint-formatter.js';
import { JbDotnetFormatterTool }
  from '../tools/jb-dotnet-formatter.js';
import { type CommandResult,
         type CommandRunner }
  from '../tools/tool.js';
import { FormatChangedFilesTask }
  from './format-changed-files.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

test(
  'format changed files task routes supported existing files',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'format-changed-files.test'));

    await workspace.writeText(
      'src/code.ts',
      'const value=1;');

    await workspace.writeText(
      'README.md',
      '# Title');

    await workspace.writeText(
      'src/Code.cs',
      'class Code{}');

    await workspace.writeText(
      'image.png',
      'image');

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
      'get-changed-files',
      () => ({ run(): Promise<string[]>
        {
          return Promise.resolve(
            [ 'src/code.ts',
              'README.md',
              'src/Code.cs',
              'deleted.ts',
              'image.png' ]);
        } }));

    const context =
      new Context(
        { taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          tools:
            [ [ 'asljs-formatter',
                new AsljsFormatterTool(
                  runner) ],
              [ 'dprint-formatter',
                new DprintFormatterTool(
                  runner) ],
              [ 'jb-dotnet-formatter',
                new JbDotnetFormatterTool(
                  runner) ] ] });

    const formatted =
      await context.run(
        new FormatChangedFilesTask(
          { workingDirectory: workspace.path,
            dotnetTarget: 'App.sln' }));

    assert.deepEqual(
      formatted,
      [ 'src/code.ts',
        'README.md',
        'src/Code.cs' ]);

    assert.equal(
      calls.length,
      4);

    assert.deepEqual(
      calls[3],
      [ 'cleanupcode',
        '--include=src/Code.cs',
        'App.sln' ]);
  });
