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
import { DotnetCliTool }
  from '../tools/dotnet.js';
import { NpmCliTool,
         resolveNpmCommand }
  from '../tools/npm.js';
import { type CommandResult,
         type CommandRunner }
  from '../tools/tool.js';
import { BuildTask }
  from './build.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

function context(
    runner: CommandRunner
  ): Context
{
  return new Context(
    { taskFactory:
        new TaskRegistry(),
      taskRunner:
        new DefaultTaskRunner(),
      serviceProvider:
        new SingletonServiceProvider(),
      tools:
        [ [ 'npm',
            new NpmCliTool(
              runner) ],
          [ 'dotnet',
            new DotnetCliTool(
              runner) ] ] });
}

test(
  'build task returns no issues and no tool when nothing is found',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'build.test'));

    assert.deepEqual(
      await context(
        { run(): Promise<CommandResult>
        {
          throw new Error(
            'should not run a command');
        } })
        .run(
          new BuildTask(
            { workingDirectory: workspace.path })),
      { tool: null,
        issues: [ ] });
  });

test(
  'build task runs npm run build when package.json exists',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'build.test'));

    await workspace.writeText(
      'package.json',
      '{}');

    const calls: unknown[] = [ ];

    assert.deepEqual(
      await context(
        { run(
          command,
          arguments_
        ): Promise<CommandResult>
        {
          calls.push(
            [ command,
              ...arguments_ ]);

          return Promise.resolve(
            { exitCode: 0,
              stdout: '',
              stderr: '' });
        } })
        .run(
          new BuildTask(
            { workingDirectory: workspace.path })),
      { tool: 'npm',
        issues: [ ] });

    assert.deepEqual(
      calls,
      [ [ resolveNpmCommand().command,
          ...resolveNpmCommand().prefixArguments,
          'run',
          'build' ] ]);
  });

test(
  'build task returns issues when dotnet build fails',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'build.test'));

    await workspace.writeText(
      'App.sln',
      '');

    const result =
      await context(
        { run(): Promise<CommandResult>
        {
          return Promise.resolve(
            { exitCode: 1,
              stdout: '',
              stderr: 'error CS1: broken' });
        } })
        .run(
          new BuildTask(
            { workingDirectory: workspace.path }));

    assert.equal(
      result.tool,
      'dotnet');

    assert.deepEqual(
      result.issues,
      [ 'dotnet build failed with exit code 1: error CS1: broken' ]);
  });
