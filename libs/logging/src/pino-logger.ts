import pino
  from 'pino';
import { type LogEntryHead,
         type LogFields,
         type Logger }
  from './logger.js';

export class PinoLogger implements Logger
{
  readonly #logger: pino.Logger;

  constructor(
    logger: pino.Logger,
    public readonly level: string
  )
  {
    this.#logger = logger;
  }

  isLevelEnabled(
    level: string
  ): boolean
  {
    let pinoLogLevel;

    if (level === 'information') {
      pinoLogLevel = 'info';
    } else if (level === 'warning') {
      pinoLogLevel = 'warn';
    } else {
      pinoLogLevel = level;
    }

    return this.#logger
      .isLevelEnabled(
        pinoLogLevel);
  }

  trace(
    head: LogEntryHead,
    ...params: any[]
  ): void
  {
    this.#write(
      'trace',
      head,
      params);
  }

  debug(
    head: LogEntryHead,
    ...params: any[]
  ): void
  {
    this.#write(
      'debug',
      head,
      params);
  }

  information(
    head: LogEntryHead,
    ...params: any[]
  ): void
  {
    this.#write(
      'info',
      head,
      params);
  }

  warning(
    head: LogEntryHead,
    ...params: any[]
  ): void
  {
    this.#write(
      'warn',
      head,
      params);
  }

  error(
    head: LogEntryHead,
    ...params: any[]
  ): void
  {
    this.#write(
      'error',
      head,
      params);
  }

  scope(
    fields: LogFields
  ): Logger
  {
    return new PinoLogger(
      this.#logger.child(fields),
      this.level);
  }

  #write(
    level: PinoLevel,
    head: LogEntryHead,
    params: any[]
  ): void
  {
    if (!this.#logger.isLevelEnabled(level)) {
      return;
    }

    if (
      typeof head
      !== 'string'
    ) {
      this.#logger[level](
        head,
        ...params);

      return;
    }

    const consumed =
      Math.min(
        countPlaceholders(head),
        params.length);

    const fields =
      collectFields(
        params.slice(consumed));

    if (fields === null) {
      this.#logger[level](
        head,
        ...params);

      return;
    }

    this.#logger[level](
      fields,
      head,
      ...params.slice(
        0,
        consumed));
  }
}

type PinoLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

/**
 * Counts the `printf` placeholders pino interpolates, ignoring escaped `%%`.
 */
function countPlaceholders(
    message: string
  ): number
{
  return message
    .replace(
      /%%/g,
      '')
    .match(
      /%[sdifjoOc]/g)
    ?.length
    ?? 0;
}

/**
 * Pino drops arguments that no placeholder consumes. Plain objects among them
 * are merged into the record as fields, and an `Error` becomes `err`, so
 * `information('started', { port })` keeps `port` rather than losing it.
 */
function collectFields(
    extra: unknown[]
  ): LogFields | null
{
  let fields: LogFields | null = null;

  for (const value of extra) {
    if (value instanceof Error) {
      fields ??= {};
      fields.err ??= value;
    } else if (isPlainObject(value)) {
      fields =
        { ...(fields ?? {}),
          ...value };
    }
  }

  return fields;
}

function isPlainObject(
    value: unknown
  ): value is LogFields
{
  if (
    value === null
    || typeof value
       !== 'object'
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return prototype === Object.prototype
    || prototype === null;
}
