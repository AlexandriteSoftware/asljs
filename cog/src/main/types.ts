import { type Logger,
         type LoggerProvider }
  from 'asljs-logging';
import { HostConsole }
  from '../console.js';
import { Context }
  from '../context.js';

export interface ExecutionContext
{
  loggerProvider: LoggerProvider;
  logger: Logger;
  console: HostConsole;
  automation: Context;
}

export interface MainOptions
{
  envelopePath?: string;
  patchPath?: string;
  patchVerifyCmd?: string;
}
