import pino
  from 'pino';

export function createLogger(options = { }) {
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

  const proxy =
    { trace: message => logger.trace(message),
      debug: message => logger.debug(message),
      info: message => logger.info(message),
      information: message => logger.info(message),
      warning: message => logger.warn(message),
      warn: message => logger.warn(message),
      error: message => logger.error(message) };

  return proxy;
}