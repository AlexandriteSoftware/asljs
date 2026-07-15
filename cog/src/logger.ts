import pino
  from 'pino';

export interface Logger
{
  isLevelEnabled(
    level: string
  ): boolean;
  scope: (
    properties: Record<string, unknown>
  ) => Logger;
  trace: (
    ...args: unknown[]
  ) => void;
  debug: (
    ...args: unknown[]
  ) => void;
  info: (
    ...args: unknown[]
  ) => void;
  warn: (
    ...args: unknown[]
  ) => void;
  error: (
    ...args: unknown[]
  ) => void;
}

export interface RootLogger extends Logger
{
  dispose: () => void;
}

export class NullLogger implements RootLogger
{
  constructor()
  {
  }

  isLevelEnabled(
    level: string
  ): boolean
  {
    return level === 'silent';
  }

  scope(): Logger
  {
    return new NullLogger();
  }

  trace(): void
  {
  }

  debug(): void
  {
  }

  error(): void
  {
  }

  info(): void
  {
  }

  log(): void
  {
  }

  warn(): void
  {
  }

  dispose(): void
  {
  }
}

export interface LoggerOptions
{
  level?: string;
  file?: string | null;
}

export class PinoLoggerAdapter implements RootLogger
{
  constructor(
    private readonly logger: pino.Logger,
    private readonly transport: any = null
  )
  {
  }

  isLevelEnabled(
    level: string
  ): boolean
  {
    return this.logger.isLevelEnabled(level);
  }

  scope(
    properties: Record<string, unknown>
  ): Logger
  {
    return new PinoLoggerAdapter(
      this.logger.child(properties)
    );
  }

  trace(
    ...args: any[]
  ): void
  {
    const params =
      args as Parameters<pino.LogFn>;

    this.logger.trace(
      ...params
    );
  }

  debug(
    ...args: any[]
  ): void
  {
    const params =
      args as Parameters<pino.LogFn>;

    this.logger.debug(
      ...params
    );
  }

  info(
    ...args: any[]
  ): void
  {
    const params =
      args as Parameters<pino.LogFn>;

    this.logger.info(
      ...params
    );
  }

  warn(
    ...args: any[]
  ): void
  {
    const params =
      args as Parameters<pino.LogFn>;

    this.logger.warn(
      ...params
    );
  }

  error(
    ...args: any[]
  ): void
  {
    const params =
      args as Parameters<pino.LogFn>;

    this.logger.error(
      ...params
    );
  }

  dispose(): void
  {
    if (this.transport !== null) {
      this.transport.end();
    }
  }
}

/**
 * Creates a logger instance with the specified options.
 *
 * If options are not provided, tries to initialise from environment variables.
 * If no environment variables are set, defaults to level 'info' and disabled.
 *
 * Environment variables:
 *
 * - `COG_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
 *   'info', ...).
 * - `COG_LOG_FILE`: The file path to write logs to (if specified).
 */
export function createLogger(
  options: Partial<LoggerOptions> = {}
): RootLogger
{
  const envVarPrefix = 'COG_';

  let level;

  if (options.level !== undefined) {
    level = options.level;
  } else {
    const envLogLevel =
      process.env[`${envVarPrefix}LOG_LEVEL`];

    if (envLogLevel !== undefined) {
      level = envLogLevel;
    } else {
      level = 'silent';
    }
  }

  if (level === 'silent') {
    return new NullLogger();
  }

  let file;

  if (options.file !== undefined) {
    file = options.file;
  } else {
    const envLogFile =
      process.env[`${envVarPrefix}LOG_FILE`];

    if (envLogFile !== undefined) {
      file = envLogFile;
    } else {
      file = null;
    }
  }

  let transport = null;

  if (file === null) {
    transport = pino.transport(
      {
        target: 'pino-pretty',
        options: {
          messageFormat: '{instanceId}: {msg}',
          ignore: 'instanceId',
          colorize: true
        }
      }
    );
  } else {
    transport = pino.transport(
      { target: 'pino/file', options: { destination: file, mkdir: true } }
    );
  }

  const logger =
    pino(
      { base: null, level },
      transport);

  return new PinoLoggerAdapter(
    logger,
    transport
  );
}
