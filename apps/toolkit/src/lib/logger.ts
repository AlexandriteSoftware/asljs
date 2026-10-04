import { createLoggerProvider as createProvider,
         type LoggerOverrides,
         type LoggerProvider,
         readLoggerOptions }
  from 'asljs-logging';

export {
  readLoggerOptions
};

/**
 * Creates the toolkit's logger provider, following `docs/Logging.md`: silent
 * unless asked, with `--loglevel`, `--logfile` and `--logformat` taking
 * precedence over `TOOLKIT_LOG_LEVEL`, `TOOLKIT_LOG_FILE` and
 * `TOOLKIT_LOG_FORMAT`.
 */
export function createLoggerProvider(
    options: LoggerOverrides = {}
  ): LoggerProvider
{
  return createProvider(
    'TOOLKIT_LOG_',
    options);
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
      '--logfile',
      '--logformat' ];

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
