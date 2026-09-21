import { LoggerProvider,
         NullLoggerProvider }
  from 'asljs-logging';
import { LinkGraph }
  from './graph.js';
import { createDefaultReaderRegistry }
  from './readers/registry.js';
import { ReaderRegistry }
  from './readers/reader.js';

export interface WritableBuffer
{
  write: (value: string) => void;
  toString: () => string;
}

export interface Environment
{
  cwd: string;

  stdout: WritableBuffer;

  stderr: WritableBuffer;

  loggerProvider: LoggerProvider;

  resolve: <T>(type: T) => T;

  register: <T>(type: T, value: T) => void;

  /**
   * Absolute path to the root of the markdown library.
   */
  library: string;

  /**
   * Readers used to extract text from library files.
   */
  readers: ReaderRegistry;

  /**
   * In-memory index of the articles and the links between them.
   *
   * Set by a long-running host, such as the MCP server, which keeps it
   * current. Absent in a one-shot process, where callers scan directly.
   */
  graph?: LinkGraph;

  /**
   * Read the whole standard input. Provided by the CLI host; absent when the
   * environment has no input stream.
   */
  readInput?: () => Promise<string>;

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
      library: cwd,
      readers:
        createDefaultReaderRegistry(),
      onDispose:
        action => disposeActions.push(action),
      dispose:
        async () =>
        {
      for (const action of disposeActions) {
        await action();
      }
    } };

  return Object.assign(
    baseEnvironment,
    environment);
}

function createInMemoryWritableBuffer(
  ): WritableBuffer
{
  const output: string[] = [ ];

  return { write(
    value: string
  ): void
  {
    output.push(value);
  },
           toString(): string
  {
    return output.join('');
  } };
}
