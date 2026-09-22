import { Command }
  from 'commander';
import assert
  from 'node:assert/strict';
import { mkdtemp,
         readFile,
         writeFile }
  from 'node:fs/promises';
import { tmpdir }
  from 'node:os';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { DefaultHostConsole }
  from '../console.js';
import { Context }
  from '../context.js';
import { createLoggerProvider }
  from '../logger.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { configureTaskCommands }
  from './tasks.js';
import { argv }
  from './test-helpers.js';
import { ExecutionContext }
  from './types.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

function createExecutionContext(
    registry: TaskRegistry
  ): ExecutionContext
{
  return { loggerProvider,
           logger:
             loggerProvider.getLogger(
               'tasks.test'),
           console:
             new DefaultHostConsole(),
           automation:
             new Context(
               { taskFactory: registry,
                 taskRunner:
                   new DefaultTaskRunner(),
                 serviceProvider:
                   new SingletonServiceProvider() }) };
}

test(
  'task commands are generated from the registry with typed options',
  async () =>
  {
    const received: unknown[] = [ ];

    const registry =
      new TaskRegistry();

    registry.register(
      'demo',
      (
          parameters
        ) =>
      {
        received.push(
          parameters);

        return { run(): Promise<void>
          {
            return Promise.resolve();
          } };
      },
      { description: 'demo task',
        parameters:
          [ { name: 'patterns',
              type: 'string[]' },
            { name: 'workingDirectory',
              type: 'string' },
            { name: 'lines',
              type: 'number' },
            { name: 'readToEnd',
              type: 'boolean' } ] });

    const program =
      new Command();

    program
      .exitOverride()
      .option(
        '--envelope <path>');

    configureTaskCommands(
      program,
      createExecutionContext(
        registry),
      registry);

    assert.deepEqual(
      program.commands
        .map(
          command => command.name()),
      [ 'demo' ]);

    await program.parseAsync(
      argv(
        'demo',
        '--patterns',
        'a',
        'b',
        '--working-directory',
        'repo',
        '--lines',
        '12',
        '--read-to-end'));

    assert.deepEqual(
      received,
      [ { patterns:
            [ 'a',
              'b' ],
          workingDirectory: 'repo',
          lines: 12,
          readToEnd: true } ]);
  });

test(
  'task commands require positional parameters and load initial context',
  async () =>
  {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          'cog-context-'));

    const contextPath =
      join(
        directory,
        'context.json');

    await writeFile(
      contextPath,
      JSON.stringify(
        [ { name: 'SQLSERVER1',
            type: 'db-connection',
            data:
              { connectionString: 'Server=SQLSERVER1' } } ]));

    const registry =
      new TaskRegistry();

    const context =
      createExecutionContext(
        registry);

    registry.register(
      'run-sql',
      parameters => ({ run(): Promise<void>
        {
          assert.deepEqual(
            parameters,
            { connection: 'SQLSERVER1',
              query: 'select 1' });

          assert.deepEqual(
            context.automation.getData(
              'SQLSERVER1'),
            { connectionString: 'Server=SQLSERVER1' });

          return Promise.resolve();
        } }),
      { parameters:
          [ { name: 'connection',
              type: 'string',
              position: true },
            { name: 'query',
              type: 'string',
              position: true } ] });

    const program =
      new Command();

    program
      .exitOverride()
      .option(
        '--init-context <path>');

    configureTaskCommands(
      program,
      context,
      registry);

    await program.parseAsync(
      argv(
        '--init-context',
        contextPath,
        'run-sql',
        'SQLSERVER1',
        'select 1'));
  });

test(
  'task commands persist context data after a task runs',
  async () =>
  {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          'cog-context-'));

    const contextPath =
      join(
        directory,
        'context.json');

    const registry =
      new TaskRegistry();

    registry.register(
      'save-value',
      () => ({ run(
          automation: Context
        ): Promise<void>
        {
          automation.setData(
            'SQLSERVER1',
            { connectionString: 'Server=SQLSERVER1' },
            'db-connection');

          return Promise.resolve();
        } }));

    const program =
      new Command();

    program
      .exitOverride()
      .option(
        '--context <path>');

    configureTaskCommands(
      program,
      createExecutionContext(
        registry),
      registry);

    await program.parseAsync(
      argv(
        '--context',
        contextPath,
        'save-value'));

    assert.deepEqual(
      JSON.parse(
        await readFile(
          contextPath,
          'utf8')),
      [ { name: 'SQLSERVER1',
          type: 'db-connection',
          data:
            { connectionString: 'Server=SQLSERVER1' } } ]);
  });

test(
  'task commands do not replace existing CLI commands',
  () =>
  {
    const registry =
      new TaskRegistry();

    registry.register(
      'restore',
      () => ({ run(): Promise<void>
        {
          return Promise.resolve();
        } }));

    const program =
      new Command();

    program
      .command(
        'restore')
      .description(
        'existing command');

    configureTaskCommands(
      program,
      createExecutionContext(
        registry),
      registry);

    assert.deepEqual(
      program.commands
        .map(
          command => command.description()),
      [ 'existing command' ]);
  });
