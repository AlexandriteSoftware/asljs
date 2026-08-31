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
import { ExtractTodosTask }
  from './extract-todos.js';

test(
  'extract-todos task passes patterns to the todos tool',
  async () =>
  {
    const requested: string[][] = [ ];

    const todo: Todo =
      { todo: 'implement',
        excerpt:
          '// TODO: implement',
        file: 'src/code.cs',
        startLine: 1,
        endLine: 1,
        startPosition: 0,
        endPosition: 18 };

    const todosTool =
      { name: 'todos',
        findAll(
        ...patterns: string[]
      ): Promise<Todo[]>
      {
        requested.push(
          patterns);

        return Promise.resolve(
          [ todo ]);
      } } as unknown as TodoTool;

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          tools:
            [ [ 'todos',
                todosTool ] ] });

    assert.deepEqual(
      await context.run(
        new ExtractTodosTask(
          { patterns:
              [ '**/*.cs' ] })),
      [ todo ]);

    await context.run(
      new ExtractTodosTask());

    assert.deepEqual(
      requested,
      [ [ '**/*.cs' ],
        [ '**/*.ts',
          '**/*.cs',
          '**/*.md' ] ]);
  });
