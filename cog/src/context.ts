import { type Logger,
         NullLogger }
  from 'asljs-logging';
import { type Service,
         type ServiceProvider }
  from './service.js';
import { type Task,
         type TaskFactory,
         type TaskRunner }
  from './task.js';
import { type ReadParameters }
  from './tools/read.js';
import { type Tool }
  from './tools/tool.js';

export interface ContextFile
{
  path: string;
  type: 'text' | 'binary';
  content?: string;
  complete?: boolean;
  update?: ReadParameters;
}

export interface ContextOptions
{
  taskFactory: TaskFactory;
  taskRunner: TaskRunner;
  serviceProvider: ServiceProvider;
  logger?: Logger;
  data?: Iterable<readonly [string, unknown]>;
  variables?: Iterable<readonly [string, unknown]>;
  tools?: Iterable<readonly [string, Tool]>;
  instruction?: string;
  task?: string;
  files?: ContextFile[];
}

export class Context
{
  readonly #data: Map<string, unknown>;
  readonly #variables: Map<string, unknown>;
  readonly #tools: Map<string, Tool>;

  readonly taskFactory: TaskFactory;
  readonly taskRunner: TaskRunner;
  readonly serviceProvider: ServiceProvider;
  readonly logger: Logger;
  readonly files: ContextFile[];
  instruction: string;
  task?: string;

  constructor(
    options: ContextOptions
  )
  {
    this.taskFactory = options.taskFactory;
    this.taskRunner = options.taskRunner;

    this.serviceProvider =
      options.serviceProvider;

    this.logger =
      options.logger
      ?? new NullLogger();

    this.instruction =
      options.instruction
      ?? '';

    this.task = options.task;

    this.files =
      options.files
      ?? [ ];

    this.#data =
      new Map(
        options.data);

    this.#variables =
      new Map(
        options.variables);

    this.#tools =
      new Map(
        options.tools);
  }

  getData<T>(
    name: string
  ): T | undefined
  {
    return this.#data.get(
      name) as T | undefined;
  }

  requireData<T>(
    name: string
  ): T
  {
    const value =
      this.getData<T>(
      name
    );

    if (value === undefined) {
      throw new Error(
        `Context data is not available: ${name}`);
    }

    return value;
  }

  setData(
    name: string,
    value: unknown
  ): void
  {
    this.#data.set(
      name,
      value);
  }

  getVariable<T>(
    name: string
  ): T | undefined
  {
    return this.#variables.get(
      name) as T | undefined;
  }

  setVariable(
    name: string,
    value: unknown
  ): void
  {
    this.#variables.set(
      name,
      value);
  }

  getTool<TTool extends Tool>(
    name: string
  ): TTool
  {
    const tool =
      this.#tools.get(
        name);

    if (!tool) {
      throw new Error(
        `Tool is not registered: ${name}`);
    }

    return tool as TTool;
  }

  async getService<TService extends Service>(
    name: string
  ): Promise<TService>
  {
    return await this.serviceProvider.get<TService>(
      name
    );
  }

  createTask<TResult = void>(
    name: string,
    parameters?: unknown
  ): Task<TResult>
  {
    return this.taskFactory.create<TResult>(
      name,
      parameters
    );
  }

  async run<TResult>(
    task: Task<TResult>
  ): Promise<TResult>
  {
    return await this.taskRunner.run(
      task,
      this);
  }
}
