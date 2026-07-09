export interface LoggerProvider
{
  getLogger(
      context?: string
    ): Logger;

  dispose(
    ): Promise<void>;

  [Symbol.asyncDispose](
    ): Promise<void>;
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
