import { type Context }
  from './context.js';

export interface Task<TResult = void>
{
  run(
    context: Context
  ): Promise<TResult>;
}

export type TaskCreator =
  (
    parameters?: unknown
  ) =>
    Task<unknown>;

export type TaskParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'object[]';

export interface TaskParameter
{
  name: string;
  type: TaskParameterType;
  description?: string;
}

export interface TaskDefinition
{
  name: string;
  description?: string;
  parameters?: TaskParameter[];
  requiresEnvelope?: boolean;
}

export interface TaskFactory
{
  create<TResult = void>(
    name: string,
    parameters?: unknown
  ): Task<TResult>;
}

export interface TaskRunner
{
  run<TResult>(
    task: Task<TResult>,
    context: Context
  ): Promise<TResult>;
}

export class TaskRegistry implements TaskFactory
{
  readonly #creators = new Map<string, TaskCreator>();
  readonly #definitions = new Map<string, TaskDefinition>();

  register(
    name: string,
    creator: TaskCreator,
    definition: Omit<TaskDefinition, 'name'> = {}
  ): void
  {
    if (
      this.#creators.has(
        name)
    ) {
      throw new Error(
        `Task is already registered: ${name}`);
    }

    this.#creators.set(
      name,
      creator);

    this.#definitions.set(
      name,
      { name,
        ...definition });
  }

  definitions(): TaskDefinition[]
  {
    return [ ...this.#definitions.values() ];
  }

  create<TResult = void>(
    name: string,
    parameters?: unknown
  ): Task<TResult>
  {
    const creator =
      this.#creators.get(
        name);

    if (!creator) {
      throw new Error(
        `Task is not registered: ${name}`);
    }

    return creator(
      parameters) as Task<TResult>;
  }
}

export class DefaultTaskRunner implements TaskRunner
{
  async run<TResult>(
    task: Task<TResult>,
    context: Context
  ): Promise<TResult>
  {
    return await task.run(
      context);
  }
}
