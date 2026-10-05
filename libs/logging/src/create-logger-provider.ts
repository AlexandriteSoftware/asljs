import { type LoggerProvider }
  from './logger-provider.js';
import { type LogFields }
  from './logger.js';
import { NullLoggerProvider }
  from './null-logger-provider.js';
import { PinoLoggerProviderOptionsBuilder }
  from './pino-logger-provider-options.js';
import { PinoLoggerProvider }
  from './pino-logger-provider.js';

/**
 * Logging options given on the command line or by the caller. Each one takes
 * precedence over its environment variable.
 */
export interface LoggerOverrides
{
  level?: string;
  file?: string;
  format?: string;
}

export interface LoggerProviderSettings
{
  /**
   * `false` for a process whose stdout carries a protocol, such as an MCP
   * server: a level with stdout as the target then throws at startup.
   */
  allowStdout?: boolean;

  /**
   * Fields written on every entry, such as the service name.
   */
  base?: LogFields;
}

/**
 * Creates the logger provider of an application, following the repository's
 * logging rules:
 *
 * - Silent unless a level or a target is given.
 * - `overrides` (usually from `readLoggerOptions(argv)`) take precedence over
 *   `<prefix>LEVEL`, `<prefix>FILE` and `<prefix>FORMAT`.
 * - A target without a level logs at `information`.
 *
 * Returns a `NullLoggerProvider` when the resulting level is `silent`.
 */
export function createLoggerProvider(
    prefix: string,
    overrides: LoggerOverrides = {},
    settings: LoggerProviderSettings = {}
  ): LoggerProvider
{
  const builder =
    new PinoLoggerProviderOptionsBuilder()
    .fromEnvironmentVariables(prefix);

  applyOverrides(
    builder,
    overrides);

  if (settings.base) {
    builder.withBase(
      settings.base);
  }

  if (
    settings.allowStdout
    === false
  ) {
    builder.withoutStdout();
  }

  const options =
    builder.build();

  if (options.level === 'silent') {
    return new NullLoggerProvider();
  }

  return new PinoLoggerProvider(
    options);
}

/**
 * Reads `--loglevel`, `--logfile` and `--logformat` from the command line, in
 * the `--name value` and `--name=value` forms.
 *
 * Logging is set up before a command parser runs, so the arguments are read
 * directly; the parser should still declare them, for help and validation.
 */
export function readLoggerOptions(
    argv: readonly string[]
  ): LoggerOverrides
{
  const options: LoggerOverrides = {};

  const level =
    readOptionValue(
      argv,
      '--loglevel');

  if (level) {
    options.level = level;
  }

  const file =
    readOptionValue(
      argv,
      '--logfile');

  if (file) {
    options.file = file;
  }

  const format =
    readOptionValue(
      argv,
      '--logformat');

  if (format) {
    options.format = format;
  }

  return options;
}

function applyOverrides(
    builder: PinoLoggerProviderOptionsBuilder,
    overrides: LoggerOverrides
  ): void
{
  if (overrides.level) {
    builder.withLevel(
      overrides.level);
  }

  if (overrides.file) {
    builder.withFile(
      overrides.file);
  }

  if (overrides.format) {
    builder.withFormat(
      overrides.format);
  }
}

function readOptionValue(
    argv: readonly string[],
    name: string
  ): string | undefined
{
  const index =
    argv.indexOf(name);

  if (
    index !== -1
    && index + 1
       < argv.length
  ) {
    return argv[index + 1];
  }

  const prefix = `${name}=`;

  const inline =
    argv.find(
      value => value.startsWith(prefix));

  return inline?.slice(
    prefix.length);
}
