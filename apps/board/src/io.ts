import { type AiAgent }
  from 'asljs-mdcli';

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
   * The board folder: it holds `Ideas`, `Plans`, `Tasks`, `Results` and
   * `Archive`; ids and paths are resolved in it.
   */
  cwd: string;
  env: Record<string, string | undefined>;
  stdout: Output;
  stderr: Output;

  /**
   * The clock results are stamped with; the system clock when absent.
   */
  now?: () => Date;

  /**
   * Finds the AI agent to use when none is named; `detectAgent` when absent.
   */
  detectAgent?: () => Promise<AiAgent | null>;
}
