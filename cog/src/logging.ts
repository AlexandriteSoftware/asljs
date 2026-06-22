import test
  from 'node:test';

export interface Logger
{
  scope: (
    properties: Record<string, unknown>
  ) => Logger;
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  dispose: () => void;
}

class TestLogger
  implements Logger
{
  constructor(
      private readonly properties: Record<string, unknown> = {}
    )
  {
  }

  scope(
      properties: Record<string, unknown>
    ): Logger
  {
    return new TestLogger(
      { ...this.properties,
        ...properties });
  }

  trace(
      ...args: unknown[]
    ): void
  {
    console.log(
      this.format(
        args));
  }

  debug(
      ...args: unknown[]
    ): void
  {
    this.trace(
      ...args);
  }

  error(
      ...args: unknown[]
    ): void
  {
    this.trace(
      ...args);
  }

  info(
      ...args: unknown[]
    ): void
  {
    this.trace(
      ...args);
  }

  log(
      ...args: unknown[]
    ): void
  {
    this.trace(
      ...args);
  }

  warn(
      ...args: unknown[]
    ): void
  {
    this.trace(
      ...args);
  }

  dispose(): void
  {
  }

  private format(
      args: unknown[]
    ): string
  {
    const prefix =
      Object.keys(
        this.properties)
        .length === 0
        ? ''
        : `${JSON.stringify(
            this.properties)} `;

    return `${prefix}${args
      .map(
        item =>
          typeof item === 'string'
            ? item
            : JSON.stringify(
              item))
      .join(
        ' ')}`;
  }
}

export function createLogger(): Logger
{
  return new TestLogger();
}
