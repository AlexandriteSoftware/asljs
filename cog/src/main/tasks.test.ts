import { Command }
  from 'commander';
import assert
  from 'node:assert/strict';
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
