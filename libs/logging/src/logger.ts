/**
 * Named values attached to a log entry, written as fields of the record.
 */
export type LogFields = Record<string, unknown>;

/**
 * The first argument of a log method: a message, or fields (or an `Error`)
 * followed by an optional message.
 *
 * - `logger.information('started')`
 * - `logger.information('listening on %s', url)`
 * - `logger.information({ port, env }, 'listening on %s', url)`
 * - `logger.error(error, 'request failed')`
 * - `logger.error({ err: error, path }, 'request failed')`
 *
 * After the message come its `printf` values (`%s`, `%d`, `%o`, ...).
 */
export type LogEntryHead =
  | string
  | LogFields
  | Error;

export interface Logger
{
  readonly level: string;

  isLevelEnabled(
    level: string
  ): boolean;

  trace(
    head: LogEntryHead,
    ...params: any[]
  ): void;

  debug(
    head: LogEntryHead,
    ...params: any[]
  ): void;

  information(
    head: LogEntryHead,
    ...params: any[]
  ): void;

  warning(
    head: LogEntryHead,
    ...params: any[]
  ): void;

  error(
    head: LogEntryHead,
    ...params: any[]
  ): void;
}
