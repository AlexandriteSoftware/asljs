import { LoggerProvider }
  from './logger-provider.js';
import { Logger }
  from './logger.js';
import { NullLogger }
  from './null-logger.js';


export class NullLoggerProvider
  implements
    LoggerProvider
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

