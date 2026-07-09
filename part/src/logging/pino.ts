import pino
  from 'pino';
import { Logger,
         LoggerProvider }
  from './logging.js';
import { NullLoggerProvider }
  from './null.js';

export interface LoggerOptions
{
  level: string;
  file?: string;
  envVarPrefix?: string;
}

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
  const envVarPrefix =
    options.envVarPrefix
    ?? process.env.ASLJS_LOG_ENV_VAR_PREFIX
    ?? 'ASLJS_LOG_';

  const level =
    options.level
    ?? process.env[`${envVarPrefix}LEVEL`]
    ?? 'silent';

  if (level === 'silent') {
    return new NullLoggerProvider();
  }

  const file =
    options.file
    ?? process.env[`${envVarPrefix}FILE`]
    ?? undefined;
  
  const loggerProvider =
    new PinoLoggerProvider(
      { level,
        file });

  return loggerProvider;
}

class PinoLoggerProvider
  implements LoggerProvider
{
  readonly #logger: pino.Logger;
  readonly #level: string;
  readonly #transport: ReturnType<typeof pino.transport>;

  constructor(
      options: Partial<LoggerOptions>
    )
  {
    const level =
      options.level
      ?? 'silent';

    this.#level = level;

    const file =
      options.file
      ?? null;

    let pinoLogLevel;

    if (level === 'information') {
      pinoLogLevel = 'info';
    } else if (level === 'warning') {
      pinoLogLevel = 'warn';
    } else {
      pinoLogLevel = level;
    }

    if (file) {
      this.#transport =
        pino.transport(
          { target: 'pino/file',
            options:
              { destination: file,
                mkdir: true } });
    } else {
      this.#transport =
        pino.transport(
          { target: 'pino-pretty',
            options:
              { messageFormat: '{context}: {msg}',
                ignore: 'context',
                colorize: true } });
    }

    this.#logger =
      pino(
        { base: null,
          level: pinoLogLevel },
        this.#transport);
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
    ): Promise<void>
  {
    this.#transport.flushSync();
    this.#transport.end();

    return Promise.resolve();
  }

  [Symbol.asyncDispose](
    ): Promise<void>
  {
    return this.dispose();
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
