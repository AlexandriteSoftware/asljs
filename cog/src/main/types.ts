import { type HostConsole }
  from '../console.js';
import { type Logger }
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

export interface NewEnvelope
{
  instruction: string;
  files: unknown[];
}
