import { createTestLoggerProvider }
  from 'asljs-testing';
import test
  from 'node:test';
import { Io }
  from '../io.js';
import { WorkingTree }
  from '../results.js';

/**
 * One provider for every test file that imports this module, configured by
 * `ASLJS_TEST_LOG_LEVEL`, `ASLJS_TEST_LOG_FILE` and `ASLJS_TEST_LOG_FORMAT`.
 */
const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

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

export const TEST_TREE: WorkingTree =
  Object.freeze(
    { commit: '0123abc',
      branch: 'main',
      changes:
        Object.freeze(
          [ 'M reqs/R1 Root.md' ]) as string[] });

/**
 * An `Io` that collects output, stamps executions with a fixed time, and
 * records `TEST_TREE` as the working directory.
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
           workingTree:
             async () => TEST_TREE,
           detectAgent: async () => null,
           loggerProvider,
           out: () => out,
           err: () => err };
}
