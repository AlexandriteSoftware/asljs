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
  cwd: string;
  env: Record<string, string | undefined>;
  stdout: Output;
  stderr: Output;

  /**
   * The clock evidence log entries are stamped with; the system clock when
   * absent.
   */
  now?: () => Date;
}
