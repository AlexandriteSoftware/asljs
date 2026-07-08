export interface LoggerProvider
{
  getLogger(
      context?: string
    ): Logger;

  dispose(
    ): void;

  [Symbol.dispose](
    ): void;
}

export interface Logger
{
  readonly level: string;

  isLevelEnabled(
      level: string
    ): boolean;

  trace(
      message: string,
      ...params: any[]
    ): void;

  debug(
      message: string,
      ...params: any[]
    ): void;

  information(
      message: string,
      ...params: any[]
    ): void;

  warning(
      message: string,
      ...params: any[]
    ): void;

  error(
      message: string,
      ...params: any[]
    ): void;
}

export interface LoggerOptions
{
  level: string;
  file?: string | null;
}

export class NullLogger
  implements Logger
{
  level = 'silent';

  isLevelEnabled(
      level: string
    ): boolean
  {
    return level === 'silent';
  }

  trace(
    ): void
  {
  }

  debug(
    ): void
  {
  }

  information(
    ): void
  {
  }

  warning(
    ): void
  {
  }

  error(
    ): void
  {
  }

  scope(
    ): Logger
  {
    return new NullLogger();
  }
}

export class NullLoggerProvider
  implements LoggerProvider
{
  readonly #logger: Logger = new NullLogger();

  getLogger(
    ): Logger
  {
    return this.#logger;
  }

  dispose(
    ): void
  {
    // nop
  }

  [Symbol.dispose](
    ): void
  {
    this.dispose();
  }
}
