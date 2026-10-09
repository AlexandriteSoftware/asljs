import { type LogEntryHead,
         type LogFields,
         type Logger }
  from 'asljs-logging';

export interface LogEntry
{
  level: string;
  message: string;
  fields: LogFields;
}

const LEVELS =
  [ 'trace',
    'debug',
    'information',
    'warning',
    'error' ];

/**
 * A logger at `trace` that keeps its entries, so that a test can assert what
 * was logged: the message, and the fields of an entry that has them.
 */
export function createRecordingLogger(
  ): {
  logger: Logger;
  entries: LogEntry[];
}
{
  const entries: LogEntry[] = [ ];

  const write =
    (
        level: string,
        head: LogEntryHead,
        params: unknown[]
      ): void =>
    {
    if (
      typeof head
      === 'string'
    ) {
      entries.push(
        { level,
          message: head,
          fields: {} });

      return;
    }

    entries.push(
      { level,
        message:
          String(params[0] ?? ''),
        fields:
          head instanceof Error
          ? { err: head }
          : head });
  };

  const logger: Logger =
    { level: 'trace',
      isLevelEnabled:
        level => LEVELS.includes(level),
      trace:
        (head, ...params) =>
      write(
        'trace',
        head,
        params),
      debug:
        (head, ...params) =>
      write(
        'debug',
        head,
        params),
      information:
        (head, ...params) =>
      write(
        'information',
        head,
        params),
      warning:
        (head, ...params) =>
      write(
        'warning',
        head,
        params),
      error:
        (head, ...params) =>
      write(
        'error',
        head,
        params),
      scope: () => logger };

  return { logger,
           entries };
}
