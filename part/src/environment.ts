import { createLogger }
  from './logging.js';
import { Logger,
         RootLogger }
  from './logging.js';
import { CopilotRequest }
  from './commands/update.js';

export interface Environment {
  cwd: string;
  stdout: WritableBuffer;
  stderr: WritableBuffer;
  logger: RootLogger;
  resolve: <T>(type: T) => T;
  register: <T>(type: T, value: T) => void;
  definitions: string;
  project: string;
  runCopilotCli?: (
      logger: Logger,
      value: CopilotRequest
    ) => Promise<string>;
  exitCode?: number;
}

export function createEnvironment(
    environment: Partial<Environment> = { }
  ): Environment
{
  const cwd =
    process.cwd();

  const registry = new Map();

  const baseEnvironment: Environment =
    {
      cwd,
      stdout: createInMemoryWritableBuffer(),
      stderr: createInMemoryWritableBuffer(),
      logger: createLogger(),
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
      project: cwd
    };

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
