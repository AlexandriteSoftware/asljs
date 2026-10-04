import { type LogFields }
  from './logger.js';

/**
 * How entries are written:
 *
 * - `json` - one JSON object per line.
 * - `text` - one readable line per entry, without colour codes.
 * - `pretty` - `text` with colour codes; stdout and stderr only.
 * - `auto` - `pretty` on a terminal, `json` on any other stream or file.
 */
export type LogFormat =
  | 'auto'
  | 'json'
  | 'text'
  | 'pretty';

export interface PinoLoggerProviderOptions
{
  /**
   * The minimum level written. `silent` writes nothing.
   */
  level: string;

  /**
   * Where entries go: a file path, `stdout` or `stderr`. Absent means
   * `stdout`.
   */
  file?: string;

  /**
   * How entries are written. Absent means `auto`.
   */
  format?: LogFormat;

  /**
   * Fields written on every entry, such as the service name.
   */
  base?: LogFields;

  /**
   * When `false`, writing to stdout at any level but `silent` throws. For
   * processes whose stdout carries a protocol, such as MCP servers.
   */
  allowStdout?: boolean;
}

export const LOG_LEVELS: readonly string[] =
  Object.freeze(
    [ 'silent',
      'trace',
      'debug',
      'information',
      'warning',
      'error' ]);

export const LOG_FORMATS: readonly LogFormat[] =
  Object.freeze(
    [ 'auto',
      'json',
      'text',
      'pretty' ]);

/**
 * Creates a logger options builder.
 *
 * With nothing set, the level is `silent`. Setting a file, without a level,
 * makes it `information`, so naming a target is enough to enable logging.
 */
export class PinoLoggerProviderOptionsBuilder
{
  #level?: string;
  #file?: string;
  #format?: LogFormat;
  #base?: LogFields;
  #allowStdout: boolean = true;

  /**
   * Updates the options from environment variables, keeping the current value
   * for any variable that is unset:
   *
   * - `<prefix>LEVEL` - the level.
   * - `<prefix>FILE` - a file path, `stdout` or `stderr`.
   * - `<prefix>FORMAT` - `auto`, `json`, `text` or `pretty`.
   */
  fromEnvironmentVariables(
    envVarPrefix: string = 'ASLJS_LOG_'
  ): PinoLoggerProviderOptionsBuilder
  {
    const level =
      process.env[`${envVarPrefix}LEVEL`];

    if (level) {
      this.withLevel(level);
    }

    const file =
      process.env[`${envVarPrefix}FILE`];

    if (file) {
      this.withFile(file);
    }

    const format =
      process.env[`${envVarPrefix}FORMAT`];

    if (format) {
      this.withFormat(format);
    }

    return this;
  }

  withLevel(
    level: string
  ): PinoLoggerProviderOptionsBuilder
  {
    validateLevel(level);
    this.#level = level;
    return this;
  }

  withFile(
    file: string
  ): PinoLoggerProviderOptionsBuilder
  {
    this.#file = file;
    return this;
  }

  withFormat(
    format: string
  ): PinoLoggerProviderOptionsBuilder
  {
    validateFormat(format);
    this.#format = format;
    return this;
  }

  withBase(
    base: LogFields
  ): PinoLoggerProviderOptionsBuilder
  {
    this.#base =
      { ...base };

    return this;
  }

  /**
   * Refuses stdout as the target, for processes whose stdout carries a
   * protocol. `build()` then throws when a level is set and the target is
   * stdout.
   */
  withoutStdout(): PinoLoggerProviderOptionsBuilder
  {
    this.#allowStdout = false;
    return this;
  }

  build(): PinoLoggerProviderOptions
  {
    const level =
      this.#level
      ?? (this.#file === undefined
        ? 'silent'
        : 'information');

    const options: PinoLoggerProviderOptions =
      { level,
        file: this.#file,
        format: this.#format,
        base: this.#base,
        allowStdout: this.#allowStdout };

    resolveLogOutput(
      options,
      { stdout: false,
        stderr: false });

    return options;
  }
}

/**
 * Where and how a provider writes, after `auto` and the defaults are applied.
 */
export interface LogOutput
{
  /** `1` for stdout, `2` for stderr, or a file path. */
  destination: 1 | 2 | string;
  format: 'json' | 'text' | 'pretty';
}

/**
 * Which standard streams are terminals.
 */
export interface Terminals
{
  stdout: boolean;
  stderr: boolean;
}

/**
 * Resolves the target and format of `options`, and checks them:
 *
 * - `pretty` with a file path throws: colour codes do not belong in a file.
 * - `allowStdout: false` with stdout as the target throws, unless the level is
 *   `silent`.
 */
export function resolveLogOutput(
    options: Partial<PinoLoggerProviderOptions>,
    terminals: Terminals
  ): LogOutput
{
  const format =
    options.format
    ?? 'auto';

  validateFormat(format);

  const file =
    options.file
    ?? 'stdout';

  const destination =
    file === 'stdout'
    ? 1
    : file === 'stderr'
    ? 2
    : file;

  if (
    destination === 1
    && options.allowStdout === false
    && (options.level
        ?? 'silent')
        !== 'silent'
  ) {
    throw new Error(
      'This process cannot log to stdout, which carries its output. '
      + 'Set the log file to stderr (--logfile stderr) or to a file path '
      + '(--logfile <path>).');
  }

  if (
    format === 'pretty'
    && typeof destination
       === 'string'
  ) {
    throw new Error(
      `The log format 'pretty' writes colour codes and is only for stdout and `
      + `stderr, not the file '${destination}'. Use 'text' for readable `
      + `lines in a file.`);
  }

  if (format !== 'auto') {
    return { destination,
             format };
  }

  const isTerminal =
    destination === 1
    ? terminals.stdout
    : destination === 2
    ? terminals.stderr
    : false;

  return { destination,
           format:
             isTerminal
             ? 'pretty'
             : 'json' };
}

function validateLevel(
    level: string
  ): void
{
  if (!LOG_LEVELS.includes(level)) {
    throw new Error(
      `The log level '${level}' is invalid. Valid levels: `
      + `${LOG_LEVELS.join(', ')}.`);
  }
}

function validateFormat(
    format: string
  ): asserts format is LogFormat
{
  if (!(LOG_FORMATS as readonly string[]).includes(format)) {
    throw new Error(
      `The log format '${format}' is invalid. Valid formats: `
      + `${LOG_FORMATS.join(', ')}.`);
  }
}
