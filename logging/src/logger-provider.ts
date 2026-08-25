import { Logger }
  from './logger.js';


export interface LoggerProvider {
  getLogger(
    context?: string
  ): Logger;

  dispose(): Promise<void>;

  [Symbol.asyncDispose](): Promise<void>;
}
