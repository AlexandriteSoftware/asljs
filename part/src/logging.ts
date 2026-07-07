import pino
  from 'pino';

export interface Logger {
  level: string;
  trace(message: string): void;
  debug(message: string): void;
  info(message: string): void;
  information(message: string): void;
  warning(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  scope(context: Record<string, any>): Logger;
}

export interface RootLogger extends Logger {
  dispose(): void;
}

export interface LoggerOptions {
  level: string;
  file?: string | null;
}

/**
 * Creates a logger instance with the specified options.
 *
 * If options are not provided, tries to initialise from environment variables.
 * If no environment variables are set, defaults to level 'info' and disabled.
 * 
 * Environment variables:
 * 
 * - `PART_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
 *   'info', ...).
 * - `PART_LOG_FILE`: The file path to write logs to (if specified).
 */
export function createLogger(
    options: Partial<LoggerOptions> = { }
  ): RootLogger
{
  const level =
    options.level
    ?? process.env.PART_LOG_LEVEL
    ?? 'silent';

  if (level === 'silent') {
    return createSilentLogger();
  }

  const file =
    options.file
    ?? process.env.PART_LOG_FILE
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
            { messageFormat: '{instanceId}: {msg}',
              ignore: 'instanceId',
              colorize: true } });
  }

  const logger =
    pino(
      { base: null,
        level: pinoLogLevel },
      transport);

  const proxy: RootLogger =
    { level,
      trace: message => logger.trace(message),
      debug: message => logger.debug(message),
      info: message => logger.info(message),
      information: message => logger.info(message),
      warning: message => logger.warn(message),
      warn: message => logger.warn(message),
      error: message => logger.error(message),
      scope:
        context =>
            createLoggerFromPinoLogger(
              logger.child(context),
              level),
      dispose: () => transport.end() };

  return proxy;
}

function createLoggerFromPinoLogger(
    logger: pino.Logger,
    level: string
  ): Logger
{
  const proxy: Logger =
    { level,
      trace: message => logger.trace(message),
      debug: message => logger.debug(message),
      info: message => logger.info(message),
      information: message => logger.info(message),
      warning: message => logger.warn(message),
      warn: message => logger.warn(message),
      error: message => logger.error(message),
      scope:
        context =>
          createLoggerFromPinoLogger(
            logger.child(context),
            level) };
    
  return proxy;
}

function createSilentLogger(
  ): RootLogger
{
  const proxy: RootLogger =
    { level: 'silent',
      trace: () => { },
      debug: () => { },
      info: () => { },
      information: () => { },
      warning: () => { },
      warn: () => { },
      error: () => { },
      scope: () => createSilentLogger(),
      dispose: () => { } };

  return proxy;
}
