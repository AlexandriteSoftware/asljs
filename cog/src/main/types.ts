import { HostConsole }
  from '../console.js';
import { Logger }
  from '../logger.js';

export interface ExecutionContext
{
  logger: Logger;
  console: HostConsole;
  dispose?: () => void;
}

export interface MainOptions
{
  envelopePath?: string;
  patchPath?: string;
  patchVerifyCmd?: string;
}
