import pino
  from 'pino';
import { Logger,
         LoggerOptions,
         LoggerProvider,
         NullLoggerProvider }
  from './logging.js';

/**
 * Creates a logger instance with the specified options.
 *
 * If options are not provided, tries to initialise from environment variables.
 * If no environment variables are set, defaults to level 'info' and disabled.
 * 
 * Environment variables:
 * 
 * - `ASLJS_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
 *   'info', ...).
 * - `ASLJS_LOG_FILE`: The file path to write logs to (if specified).
 */
export function createPinoLoggerProvider(
    options: Partial<LoggerOptions> = { }
  ): LoggerProvider
{
  const level =
    options.level
    ?? process.env.ASLJS_LOG_LEVEL
    ?? 'silent';

  if (level === 'silent') {
    return new NullLoggerProvider();
  }

  const file =
    options.file
    ?? process.env.ASLJS_LOG_FILE
    ?? null;
  
  let pinoLogLevel;

  if (level === 'information') {
    pinoLogLevel = 'info';
  } else if (level === 'warning') {
    pinoLogLevel = 'warn';
  } else {
    pinoLogLevel = level;
  }

  let transport = null;

  if (file) {
    transport =
      pino.transport(
        { target: 'pino/file',
          options:
            { destination: file,
              mkdir: true } });
  } else {
    transport =
      pino.transport(
        { target: 'pino-pretty',
          options:
            { messageFormat: '{context}: {msg}',
              ignore: 'context',
              colorize: true } });
  }

  const logger =
    pino(
      { base: null,
        level: pinoLogLevel },
      transport);

  const loggerProvider =
    new PinoLoggerProvider(
      logger,
      level,
      (): void =>
      {
        transport.end();
      });

  return loggerProvider;
}

class PinoLoggerProvider
  implements LoggerProvider
{
  readonly #logger: pino.Logger;
  readonly #level: string;
  readonly #dispose: () => void;

  constructor(
      logger: pino.Logger,
      level: string,
      dispose: () => void
    )
  {
    this.#logger = logger;
    this.#level = level;
    this.#dispose = dispose;
  }

  getLogger(
      context?: string
    ): Logger
  {
    if (
      context
      && context.length > 0
    ) {
      return new PinoLogger(
        this.#logger.child(
          { context }),
        this.#level);
    }

    return new PinoLogger(
      this.#logger,
      this.#level);
  }

  dispose(
    ): void
  {
    this.#dispose();
  }

  [Symbol.dispose](
    ): void
  {
    this.dispose();
  }
}

class PinoLogger
  implements Logger
{
  readonly #logger: pino.Logger;

  constructor(
      logger: pino.Logger,
      public readonly level: string
    )
  {
    this.#logger = logger;
  }

  isLevelEnabled(
      level: string
    ): boolean
  {
    let pinoLogLevel;

    if (level === 'information') {
      pinoLogLevel = 'info';
    } else if (level === 'warning') {
      pinoLogLevel = 'warn';
    } else {
      pinoLogLevel = level;
    }

    return this.#logger
      .isLevelEnabled(
        pinoLogLevel);
  }

  trace(
      message: string,
      ...params: any[]
    ): void
  {
    this.#logger.trace(
      message,
      ...params);
  }

  debug(
      message: string,
      ...params: any[]
    ): void
  {
    this.#logger.debug(
      message,
      ...params);
  }

  information(
      message: string,
      ...params: any[]
    ): void
  {
    this.#logger.info(
      message,
      ...params);
  }

  warning(
      message: string,
      ...params: any[]
    ): void
  {
    this.#logger.warn(
      message,
      ...params);
  }

  error(
      message: string,
      ...params: any[]
    ): void
  {
    this.#logger.error(
      message,
      ...params);
  }
}
