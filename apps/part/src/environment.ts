import { LoggerProvider,
         NullLoggerProvider }
  from 'asljs-logging';
import { Providers,
         providersFactory }
  from './providers/providers.js';

export interface Environment
{
  cwd: string;

  stdout: WritableBuffer;

  stderr: WritableBuffer;

  loggerProvider: LoggerProvider;

  resolve: <T>(type: T) => T;

  register: <T>(type: T, value: T) => void;

  /**
   * Definition sources: absolute paths of md-only folders, plugin library
   * folders or plugin files, or package specifiers. Empty means no
   * definitions.
   */
  definitions: string[];

  /**
   * Path to the directory containing the artefacts.
   */
  project: string;

  getProviders: () => Providers;

  exitCode?: number;

  onDispose: (
    action: () => Promise<void>
  ) => void;

  dispose: () => Promise<void>;
}

export function createEnvironment(
    environment: Partial<Environment> = {}
  ): Environment
{
  const cwd =
    process.cwd();

  const registry = new Map();

  const disposeActions: (() => Promise<void>)[] = [ ];

  const baseEnvironment: Environment =
    { cwd,
      stdout:
        createInMemoryWritableBuffer(),
      stderr:
        createInMemoryWritableBuffer(),
      loggerProvider:
        new NullLoggerProvider(),
      resolve:
        type =>
      registry.get(type)
        ?? type,
      register:
        (type, value) =>
      registry.set(
        type,
        value),
      definitions: [ ],
      project: cwd,
      getProviders:
        function (): Providers
    {
      return providersFactory(
        this.loggerProvider,
        this.project,
        this.definitions);
    },
      onDispose:
        action => disposeActions.push(action),
      dispose:
        async () =>
        {
      for (const action of disposeActions) {
        await action();
      }
    } };

  const constructedEnvironment: Environment =
    Object.assign(
      baseEnvironment,
      environment);

  return constructedEnvironment;
}

interface WritableBuffer
{
  write: (value: string) => void;
  toString: () => string;
}

function createInMemoryWritableBuffer(
  ): WritableBuffer
{
  const output: string[] = [ ];

  const buffer: WritableBuffer =
    { write(
      value: string
    ): void
    {
      output.push(value);
    },
      toString(): string
    {
      return output.join('');
    } };

  return buffer;
}
