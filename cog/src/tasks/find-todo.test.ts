import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { type Todo,
         type TodoTool }
  from '../tools/todo.js';
import { FindTodoTask }
  from './find-todo.js';

function createContext(
    todo: Todo | null,
    requested: string[][]
  ): Context
{
  const todosTool =
    { name: 'todos',
      findOne(
      ...patterns: string[]
    ): Promise<Todo | null>
    {
      requested.push(
        patterns);

      return Promise.resolve(
        todo);
    } } as unknown as TodoTool;

  return new Context(
    { taskFactory:
        new TaskRegistry(),
      taskRunner:
        new DefaultTaskRunner(),
      serviceProvider:
        new SingletonServiceProvider(),
      tools:
        [ [ 'todos',
            todosTool ] ] });
}

test(
  'find-todo task returns the first todo without changing context data',
  async () =>
  {
    const requested: string[][] = [ ];

    const todo: Todo =
      { todo:
          'implement\n  - details',
        excerpt:
          '// TODO: implement\n  //   - details',
        file: 'src/code.cs',
        startLine: 3,
        endLine: 4,
        startPosition: 10,
        endPosition: 40 };

    const context =
      createContext(
        todo,
        requested);

    assert.equal(
      await context.run(
        new FindTodoTask(
          { patterns:
              [ '**/*.cs' ] })),
      todo);

    assert.equal(
      context.getData(
        'todo'),
      undefined);

    assert.deepEqual(
      requested,
      [ [ '**/*.cs' ] ]);
  });

test(
  'find-todo task returns null when no todo is found',
  async () =>
  {
    const requested: string[][] = [ ];

    const context =
      createContext(
        null,
        requested);

    assert.equal(
      await context.run(
        new FindTodoTask()),
      null);

    assert.deepEqual(
      requested,
      [ [ '**/*.ts',
          '**/*.cs',
          '**/*.md' ] ]);
  });
