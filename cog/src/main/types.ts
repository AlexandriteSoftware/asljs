import { HostConsole }
  from '../console.js';
import { type Logger,
         type LoggerProvider }
  from 'asljs-logging';

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
