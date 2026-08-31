import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { type CopilotService }
  from '../copilot.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { type Todo }
  from '../tools/todo.js';
import { TodoTask }
  from './todo.js';

const todo: Todo =
  { todo: 'implement',
    excerpt:
      '// TODO: implement',
    file: 'src/code.ts',
    startLine: 1,
    endLine: 1,
    startPosition: 0,
    endPosition: 18 };

function baseRegistry(
    findTodoResults: (Todo | null)[],
    options: { buildIssues?: string[][]; testIssues?: string[][]; } = {}
  ): TaskRegistry
{
  const registry =
    new TaskRegistry();

  registry.register(
    'commit-if-changed',
    () => ({ run(): Promise<null>
      {
        return Promise.resolve(
          null);
      } }));

  registry.register(
    'format-changed-files',
    () => ({ run(): Promise<string[]>
      {
        return Promise.resolve(
          [ ]);
      } }));

  registry.register(
    'build',
    () => ({ run(): Promise<{ tool: null; issues: string[]; }>
      {
        return Promise.resolve(
          { tool: null,
            issues:
              options.buildIssues?.shift() ?? [ ] });
      } }));

  registry.register(
    'test',
    () => ({ run(): Promise<{ tool: null; issues: string[]; }>
      {
        return Promise.resolve(
          { tool: null,
            issues:
              options.testIssues?.shift() ?? [ ] });
      } }));

  registry.register(
    'find-todo',
    () => ({ run(): Promise<Todo | null>
      {
        return Promise.resolve(
          findTodoResults.shift() ?? null);
      } }));

  return registry;
}

test(
  'todo task returns immediately when there is no TODO',
  async () =>
  {
    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ null ]),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider() });

    assert.deepEqual(
      await context.run(
        new TodoTask()),
      { todo: null,
        addressed: false });
  });

test(
  'todo task commits when Copilot addresses and removes the TODO',
  async () =>
  {
    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(): Promise<{ content: string; }>
        {
          return Promise.resolve(
            { content: 'TODO_DONE' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ todo,
                null ]),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    assert.deepEqual(
      await context.run(
        new TodoTask()),
      { todo,
        addressed: true });
  });

test(
  'todo task stops when Copilot reports it could not address the TODO',
  async () =>
  {
    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(): Promise<{ content: string; }>
        {
          return Promise.resolve(
            { content:
                'TODO_STOP cannot find the file' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ todo ]),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    await assert.rejects(
      () =>
        context.run(
          new TodoTask()),
      /stop:/);
  });

test(
  'todo task fails when the TODO is still present after Copilot replies done',
  async () =>
  {
    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(): Promise<{ content: string; }>
        {
          return Promise.resolve(
            { content: 'TODO_DONE' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ todo,
                todo ]),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    await assert.rejects(
      () =>
        context.run(
          new TodoTask()),
      /still present/);
  });

test(
  'todo task asks Copilot to fix build issues and retries until it passes',
  async () =>
  {
    const prompts: string[] = [ ];

    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(
          request
        ): Promise<{ content: string; }>
        {
          prompts.push(
            request.prompt);

          return Promise.resolve(
            { content: 'TODO_DONE' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ todo,
                null ],
              { buildIssues:
                  [ [ 'error TS1: broken' ],
                    [ ] ] }),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    assert.deepEqual(
      await context.run(
        new TodoTask()),
      { todo,
        addressed: true });

    assert.equal(
      prompts.length,
      2);

    assert.match(
      prompts[1],
      /error TS1: broken/);
  });

test(
  'todo task fails when build issues remain after the retry limit',
  async () =>
  {
    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(): Promise<{ content: string; }>
        {
          return Promise.resolve(
            { content: 'TODO_DONE' });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            baseRegistry(
              [ todo,
                null ],
              { buildIssues:
                  [ [ 'error TS1: broken' ],
                    [ 'error TS1: broken' ],
                    [ 'error TS1: broken' ] ] }),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    await assert.rejects(
      () =>
        context.run(
          new TodoTask()),
      /build still has issues/);
  });
