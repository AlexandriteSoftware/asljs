import pino
  from 'pino';
import { LoggerProvider }
  from './logger-provider.js';
import { Logger }
  from './logger.js';
import { PinoLoggerProviderOptions }
  from './pino-logger-provider-options.js';
import { PinoLogger }
  from './pino-logger.js';

/**
 * Creates a Pino logger provider with the specified options.
 */
export class PinoLoggerProvider implements LoggerProvider
{
  readonly #logger: pino.Logger;
  readonly #level: string;
  readonly #transport: ReturnType<typeof pino.transport>;

  constructor(
    options: Partial<PinoLoggerProviderOptions>
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

    if (
      level
      === 'information'
    ) {
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

  dispose(): Promise<void>
  {
    this.#transport.flushSync();
    this.#transport.end();

    return Promise.resolve();
  }

  [Symbol.asyncDispose](): Promise<void>
  {
    return this.dispose();
  }
}
