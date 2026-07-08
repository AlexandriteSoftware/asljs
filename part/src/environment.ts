import { LoggerProvider,
         NullLoggerProvider }
  from './logging/logging.js';
import { Logger }
  from './logging/logging.js';
import { CodeGenerationRequest }
  from './commands/update.js';
import { ArtefactProvider,
         DefinitionProvider }
  from './index.js';

export interface Environment
{
  cwd: string;

  stdout: WritableBuffer;

  stderr: WritableBuffer;

  loggerProvider: LoggerProvider;

  resolve: <T>(type: T) => T;

  register: <T>(type: T, value: T) => void;

  /**
   * Path to the directory containing the artefact definitions.
   */
  definitions: string;

  /**
   * Path to the directory containing the artefacts.
   */
  project: string;

  getArtefactDefinitionProvider:
    () => DefinitionProvider;

  getArtefactProvider:
    () => ArtefactProvider;

  runCopilotCli?:
    (
      logger: Logger,
      value: CodeGenerationRequest
    ) => Promise<string>;

  exitCode?: number;

  onDispose:
    (
      action: () => void
    ) => void;

  dispose: () => void;
}

export function createEnvironment(
    environment: Partial<Environment> = { }
  ): Environment
{
  const cwd =
    process.cwd();

  const registry = new Map();

  const disposeActions: (() => void)[] = [ ];

  const baseEnvironment: Environment =
    { cwd,
      stdout: createInMemoryWritableBuffer(),
      stderr: createInMemoryWritableBuffer(),
      loggerProvider: new NullLoggerProvider(),
      resolve:
        type =>
          registry.get(type)
          ?? type,
      register:
        (type, value) =>
          registry.set(
            type,
            value),
      definitions: cwd,
      project: cwd,
      getArtefactDefinitionProvider:
        function (
          ): DefinitionProvider
        {
          return new DefinitionProvider(
            this.loggerProvider
              .getLogger(
                'DefinitionProvider'),
            this.project,
            this.definitions);
        },
      getArtefactProvider:
        function (
          ): ArtefactProvider
        {
          return new ArtefactProvider(
            this.loggerProvider
              .getLogger(
                'ArtefactProvider'),
            this.project,
            this.getArtefactDefinitionProvider());
        },
      onDispose:
        action =>
          disposeActions.push(action),
      dispose:
        () => {
          for (const action of disposeActions) {
            action();
          }
        } };

  const constructedEnvironment: Environment =
    Object.assign(
      baseEnvironment,
      environment);

  return constructedEnvironment;
}

interface WritableBuffer {
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
      toString(
        ): string
      {
        return output.join('');
      } };

  return buffer;
}
