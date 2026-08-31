import { type Context }
  from '../context.js';
import { type Task }
  from '../task.js';
import { defaultTodoPatterns,
         type Todo,
         type TodoTool }
  from '../tools/todo.js';

export interface FindTodoTaskParameters
{
  patterns?: string[];
}

export class FindTodoTask implements Task<Todo | null>
{
  constructor(
    readonly parameters: FindTodoTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<Todo | null>
  {
    const patterns =
      this.parameters.patterns
      ?? defaultTodoPatterns;

    context.logger.debug(
      'find-todo: starting');

    context.logger.trace(
      'find-todo: searching %o',
      patterns);

    const todo =
      await context.getTool<TodoTool>(
      'todos'
    )
      .findOne(
        ...patterns);

    if (todo === null) {
      context.logger.debug(
        'find-todo: no TODO found');

      context.logger.debug(
        'find-todo: done');

      return null;
    }

    context.logger.debug(
      'find-todo: found TODO in %s:%d',
      todo.file,
      todo.startLine);

    context.logger.debug(
      'find-todo: done');

    return todo;
  }
}
