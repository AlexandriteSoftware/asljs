export interface Environment
{
  cwd: string;

  stdout: WritableBuffer;

  stderr: WritableBuffer;

  exitCode?: number;

  onDispose: (action: () => Promise<void>) => void;

  dispose: () => Promise<void>;
}

export function createEnvironment(
    environment: Partial<Environment> = {}
  ): Environment
{
  const cwd =
    process.cwd();

  const registry = new Map();

  const disposeActions: (() => Promise<void>)[] = [];

  const baseEnvironment: Environment =
    { cwd: cwd,
      stdout:
        createInMemoryWritableBuffer(),
      stderr:
        createInMemoryWritableBuffer(),
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
  const output: string[] = [];

  const buffer: WritableBuffer =
    { write:
        (value: string): void =>
    {
      output.push(value);
    },
      toString:
        (): string =>
    {
      return output.join('');
    } };

  return buffer;
}
