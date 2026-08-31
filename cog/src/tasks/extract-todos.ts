import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { defaultTodoPatterns,
         type Todo,
         type TodoTool }
  from '../tools/todo.js';

export interface ExtractTodosTaskParameters
{
  patterns?: string[];
}

export class ExtractTodosTask implements Task<Todo[]>
{
  constructor(
    readonly parameters: ExtractTodosTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<Todo[]>
  {
    const patterns =
      this.parameters.patterns
      ?? defaultTodoPatterns;

    context.logger.debug(
      'extract-todos: starting, patterns %o',
      patterns);

    const todos =
      await context.getTool<TodoTool>(
      'todos'
    )
      .findAll(
        ...patterns);

    context.logger.debug(
      'extract-todos: done, found %d TODO(s)',
      todos.length);

    return todos;
  }
}
