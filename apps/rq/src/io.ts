import { type AiAgent }
  from 'asljs-mdcli';
import { type Retention,
         type WorkingTree }
  from './results.js';

export interface Output
{
  write(
    text: string
  ): unknown;
}

/**
 * What a command reads from and writes to, so that tests can replace it.
 */
export interface Io
{
  /**
   * The working folder: relative paths resolve against it, ids and file
   * names are searched for in it, and its `.rq` folder holds the results.
   */
  cwd: string;
  env: Record<string, string | undefined>;
  stdout: Output;
  stderr: Output;

  /**
   * The clock executions are stamped with; the system clock when absent.
   */
  now?: () => Date;

  /**
   * Reads the git working directory an execution records;
   * `readWorkingTree` when absent.
   */
  workingTree?: (folder: string) => Promise<WorkingTree>;

  /**
   * Finds the AI agent to use when none is named; `detectAgent` when
   * absent.
   */
  detectAgent?: () => Promise<AiAgent | null>;

  /**
   * The limits of the `.rq` folder; `RETENTION` when absent.
   */
  retention?: Readonly<Retention>;
}
