import pino
  from 'pino';
import { Logger }
  from './logger.js';

export class PinoLogger implements Logger {
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
  ): boolean {
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
  ): void {
    this.#logger.trace(
      message,
      ...params);
  }

  debug(
    message: string,
    ...params: any[]
  ): void {
    this.#logger.debug(
      message,
      ...params);
  }

  information(
    message: string,
    ...params: any[]
  ): void {
    this.#logger.info(
      message,
      ...params);
  }

  warning(
    message: string,
    ...params: any[]
  ): void {
    this.#logger.warn(
      message,
      ...params);
  }

  error(
    message: string,
    ...params: any[]
  ): void {
    this.#logger.error(
      message,
      ...params);
  }
}
