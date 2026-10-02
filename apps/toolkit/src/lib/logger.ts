import { type LoggerProvider,
         PinoLoggerProvider,
         type PinoLoggerProviderOptions,
         PinoLoggerProviderOptionsBuilder }
  from 'asljs-logging';

/**
 * Creates a logger provider with the specified options.
 *
 * Explicit options take precedence over environment variables, which take
 * precedence over the default level.
 *
 * Environment variables:
 *
 * - `TOOLKIT_LOG_LEVEL`: the logging level, for example 'silent', 'trace',
 *   'debug', 'information'.
 * - `TOOLKIT_LOG_FILE`: the file to write logs to, if any.
 */
export function createLoggerProvider(
    options: Partial<PinoLoggerProviderOptions> = {}
  ): LoggerProvider
{
  const builder =
    new PinoLoggerProviderOptionsBuilder()
    .fromEnvironmentVariables('TOOLKIT_LOG_');

  if (options.file) {
    builder.withFile(
      options.file);
  }

  if (options.level) {
    builder.withLevel(
      options.level);
  }

  return new PinoLoggerProvider(
    builder.build());
}

/**
 * Reads the logging options from argv.
 *
 * Logging is configured before commander parses argv, so the flags are read
 * directly here as well as declared on the program.
 */
export function readLoggerOptions(
    argv: readonly string[]
  ): Partial<PinoLoggerProviderOptions>
{
  const options: Partial<PinoLoggerProviderOptions> = {};

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

  return options;
}

/**
 * The arguments without the logging options.
 *
 * A command's own arguments pass through commander untouched so that a flag
 * such as `--exclude` reaches it, which means the logging flags arrive too.
 * They are read from the whole argv separately, so they are removed here
 * rather than handled by every command.
 */
export function stripLoggerOptions(
    args: readonly string[]
  ): string[]
{
  const names =
    [ '--loglevel',
      '--logfile' ];

  const result: string[] = [ ];

  for (
    let index = 0;
    index < args.length;
    index += 1
  ) {
    const arg = args[index];

    if (
      names.some(
        name => arg === name)
    ) {
      // Skips the value as well as the flag.
      index += 1;

      continue;
    }

    if (
      names.some(
        name => arg.startsWith(`${name}=`))
    ) {
      continue;
    }

    result.push(arg);
  }

  return result;
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
