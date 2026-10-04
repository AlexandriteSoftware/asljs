import { format }
  from 'node:util';

/**
 * Writes a message for the person running the command to stdout.
 *
 * Progress and results are the command's output, not log entries, so they are
 * shown whatever the log level; see `docs/Logging.md`.
 */
export function report(
    message: string,
    ...values: unknown[]
  ): void
{
  process.stdout.write(
    `${format(
      message,
      ...values)}\n`);
}
