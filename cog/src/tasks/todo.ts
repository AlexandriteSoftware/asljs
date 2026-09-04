import { type Context }
  from '../context.js';
import { type CopilotService }
  from '../copilot.js';
import { type Task }
  from '../task.js';
import { type Todo }
  from '../tools/todo.js';

export interface TodoTaskParameters
{
  workingDirectory?: string;
  patterns?: string[];
}

export interface TodoTaskResult
{
  todo: Todo | null;
  addressed: boolean;
}

interface CheckTaskResult
{
  tool: 'npm' | 'dotnet' | null;
  issues: string[];
}

const stopMarker = 'TODO_STOP';
const doneMarker = 'TODO_DONE';
const maxCheckAttempts = 3;

export class TodoTask implements Task<TodoTaskResult>
{
  constructor(
    readonly parameters: TodoTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<TodoTaskResult>
  {
    const workingDirectory =
      this.parameters.workingDirectory
      ?? process.cwd();

    const patterns =
      this.parameters.patterns;

    context.logger.debug(
      'todo: starting in %s',
      workingDirectory);

    await context.run(
      context.createTask(
        'commit-if-changed',
        { workingDirectory }));

    const todo =
      await context.run(
        context.createTask<Todo | null>(
        'find-todo',
        { patterns }
      ));

    if (todo === null) {
      context.logger.debug(
        'todo: no TODO found');

      context.logger.debug(
        'todo: done');

      return { todo: null,
               addressed: false };
    }

    const copilot =
      await context.getService<CopilotService>(
      'copilot'
    );

    const todoPrompt =
      buildPrompt(
        todo);

    context.logger.trace(
      'todo: prompt:\n%s',
      todoPrompt);

    const response =
      await copilot.complete(
        { prompt: todoPrompt });

    context.logger.trace(
      'todo: response:\n%s',
      response.content);

    const content =
      response.content.trim();

    if (content.startsWith(stopMarker)) {
      throw new Error(
        `stop: Copilot did not address the TODO in ${todo.file}:${todo.startLine}: `
          + content.slice(
            stopMarker.length)
            .trim());
    }

    const remaining =
      await context.run(
        context.createTask<Todo | null>(
        'find-todo',
        { patterns }
      ));

    if (
      remaining !== null
      && remaining.file === todo.file
      && remaining.startLine === todo.startLine
      && remaining.todo === todo.todo
    ) {
      throw new Error(
        `Copilot reported the TODO in ${todo.file}:${todo.startLine} was addressed, `
          + 'but it is still present');
    }

    await context.run(
      context.createTask(
        'format-changed-files',
        { workingDirectory }));

    await ensureCheckPasses(
      context,
      'build',
      workingDirectory);

    await ensureCheckPasses(
      context,
      'test',
      workingDirectory);

    await context.run(
      context.createTask(
        'commit-if-changed',
        { workingDirectory }));

    context.logger.debug(
      'todo: done');

    return { todo,
             addressed: true };
  }
}

async function ensureCheckPasses(
    context: Context,
    taskName: 'build' | 'test',
    workingDirectory: string
  ): Promise<void>
{
  for (
    let attempt = 1;
    attempt <= maxCheckAttempts;
    attempt++
  ) {
    const result =
      await context.run(
        context.createTask<CheckTaskResult>(
        taskName,
        { workingDirectory }
      ));

    if (result.issues.length === 0) {
      return;
    }

    if (attempt === maxCheckAttempts) {
      throw new Error(
        `${taskName} still has issues after ${maxCheckAttempts} attempts:\n`
          + result.issues.join(
            '\n'));
    }

    context.logger.debug(
      'todo: asking Copilot to fix %s issues (attempt %d)',
      taskName,
      attempt);

    const copilot =
      await context.getService<CopilotService>(
      'copilot'
    );

    const fixPrompt =
      buildFixPrompt(
        taskName,
        result.issues);

    context.logger.trace(
      'todo: fix prompt:\n%s',
      fixPrompt);

    const response =
      await copilot.complete(
        { prompt: fixPrompt });

    context.logger.trace(
      'todo: fix response:\n%s',
      response.content);
  }
}

function buildFixPrompt(
    taskName: 'build' | 'test',
    issues: readonly string[]
  ): string
{
  return [ `The ${taskName} failed with the following issues:`,
           issues.join(
             '\n'),
           `Fix the code so that ${taskName} succeeds.` ].join(
             '\n\n');
}

function buildPrompt(
    todo: Todo
  ): string
{
  return [ 'Implement the following TODO in the codebase, then remove the TODO '
    + 'comment.',
           `File: ${todo.file}`,
           `Lines: ${todo.startLine}-${todo.endLine}`,
           'TODO:',
           todo.todo,
           'Excerpt:',
           todo.excerpt,
           `If you implement it, reply with exactly: ${doneMarker}`,
           'If you cannot implement it, do not change any files and reply with '
    + `${stopMarker} followed by the reason.` ].join(
      '\n\n');
}
