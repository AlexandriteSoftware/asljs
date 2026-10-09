import { Io }
  from '../io.js';

export interface TestIo extends Io
{
  /**
   * What was written to standard output.
   */
  out(): string;

  /**
   * What was written to standard error.
   */
  err(): string;
}

/**
 * An `Io` that collects output, stamps results with a fixed time, and finds
 * no AI agent unless `env` names one.
 */
export function createTestIo(
    cwd: string,
    env: Record<string, string | undefined> = {}
  ): TestIo
{
  let out = '';
  let err = '';

  return { cwd,
           env,
           stdout:
             { write:
                 (text: string) => out += text },
           stderr:
             { write:
                 (text: string) => err += text },
           now:
             () =>
      new Date(
        '2026-01-02T03:04:05.000Z'),
           detectAgent: async () => null,
           out: () => out,
           err: () => err };
}
