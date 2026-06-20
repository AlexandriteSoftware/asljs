import pino
  from 'pino';

/**
 * @typedef Logger
 * @property {string} level
 * @property {(message: string) => void} trace
 * @property {(message: string) => void} debug
 * @property {(message: string) => void} info
 * @property {(message: string) => void} information
 * @property {(message: string) => void} warning
 * @property {(message: string) => void} warn
 * @property {(message: string) => void} error
 * @property {(context: Record<string, any>) => Logger} scope
 */

/**
 * @typedef {Logger & {
 *   dispose: () => void
 * }} RootLogger
 */

/**
 * @typedef LoggerOptions
 * @property {string} level
 * @property {string?} file
 */

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
 * 
 * @param {Partial<LoggerOptions>} options
 * @returns {RootLogger}
 */
export function createLogger(
  options = { })
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

  /** @type {RootLogger} */
  const proxy =
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

/**
 * @param {pino.Logger} logger
 * @param {string} level
 * @returns {Logger}
 */
function createLoggerFromPinoLogger(
  logger,
  level)
{
  /** @type {Logger} */
  const proxy =
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

function createSilentLogger()
{
  /** @type {RootLogger} */
  const proxy =
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
