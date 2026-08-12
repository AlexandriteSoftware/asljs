import { type Logger,
         type LoggerProvider }
  from 'asljs-logging';
import { HostConsole }
  from '../console.js';

export interface ExecutionContext
{
  loggerProvider: LoggerProvider;
  logger: Logger;
  console: HostConsole;
}

export interface MainOptions
{
  envelopePath?: string;
  patchPath?: string;
  patchVerifyCmd?: string;
}
