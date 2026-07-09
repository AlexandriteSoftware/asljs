import { Logger,
         LoggerProvider }
  from './logging.js';

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
  readonly #logger: Logger =
    new NullLogger();

  getLogger(
    ): Logger
  {
    return this.#logger;
  }

  dispose(
    ): Promise<void>
  { 
    return Promise.resolve();
  }

  [Symbol.asyncDispose](
    ): Promise<void>
  {
    return this.dispose();
  }
}
