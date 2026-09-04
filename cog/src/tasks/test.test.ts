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
import { TestTask }
  from './test.js';

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
  'test task returns no issues and no tool when nothing is found',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'test.test'));

    assert.deepEqual(
      await context(
        { run(): Promise<CommandResult>
          {
            throw new Error(
              'should not run a command');
          } })
        .run(
          new TestTask(
            { workingDirectory: workspace.path })),
      { tool: null,
        issues: [ ] });
  });

test(
  'test task runs npm run test when package.json exists',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'test.test'));

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
          new TestTask(
            { workingDirectory: workspace.path })),
      { tool: 'npm',
        issues: [ ] });

    assert.deepEqual(
      calls,
      [ [ resolveNpmCommand().command,
          ...resolveNpmCommand().prefixArguments,
          'run',
          'test' ] ]);
  });

test(
  'test task returns issues when dotnet test fails',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'test.test'));

    await workspace.writeText(
      'App.csproj',
      '');

    const result =
      await context(
        { run(): Promise<CommandResult>
        {
          return Promise.resolve(
            { exitCode: 1,
              stdout: '',
              stderr: 'Failed: 1 test' });
        } })
      .run(
        new TestTask(
          { workingDirectory: workspace.path }));

    assert.equal(
      result.tool,
      'dotnet');

    assert.deepEqual(
      result.issues,
      [ 'dotnet test failed with exit code 1: Failed: 1 test' ]);
  });
