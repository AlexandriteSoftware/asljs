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

  /**
   * Returns a logger whose entries all carry `fields`, for context shared by a
   * unit of work, such as a request or a job id. The scoped logger has the same
   * level and context; fields given to a call are written after the scope's.
   *
   * The scope belongs to the returned logger, not to the code that runs while
   * it exists: pass the scoped logger to that code.
   */
  scope(
    fields: LogFields
  ): Logger;
}
