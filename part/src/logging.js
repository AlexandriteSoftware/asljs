import pino
  from 'pino';

/**
 * @typedef Logger
 * @property {string} level
 * @property {boolean} enabled
 * @property {string?} file
 * @property {(message: string) => void} trace
 * @property {(message: string) => void} debug
 * @property {(message: string) => void} info
 * @property {(message: string) => void} information
 * @property {(message: string) => void} warning
 * @property {(message: string) => void} warn
 * @property {(message: string) => void} error
 */

/**
 * @typedef LoggerOptions
 * @property {string} level
 * @property {boolean} enabled
 * @property {string?} file
 */

/**
 * @param {Partial<LoggerOptions>} options
 * @returns {Logger}
 */
export function createLogger(
  options = { })
{
  let level;

  if (!options.enabled) {
    level = 'silent';
  } else {
    if (options.level === 'information') {
      level = 'info';
    } else if (options.level === 'warning') {
      level = 'warn';
    } else {
      level = options.level || 'info';
    }
  }

  let transport;

  if (options.file) {
    transport =
      { target: 'pino/file',
        options:
          { destination: options.file,
            mkdir: true } };
  } else {
    transport =
      { target: 'pino-pretty',
        options: { colorize: true } };
  }

  const logger =
    pino(
      { level,
        transport });

  /** @type {Logger} */
  const proxy =
    { level,
      enabled: options.enabled === true,
      file: options.file ?? null,
      trace: message => logger.trace(message),
      debug: message => logger.debug(message),
      info: message => logger.info(message),
      information: message => logger.info(message),
      warning: message => logger.warn(message),
      warn: message => logger.warn(message),
      error: message => logger.error(message) };

  return proxy;
}