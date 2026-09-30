import { type LoggerProvider,
         PinoLoggerProvider,
         type PinoLoggerProviderOptions,
         PinoLoggerProviderOptionsBuilder }
  from 'asljs-logging';

/**
 * Creates a logger provider with the specified options.
 *
 * Explicit options take precedence over environment variables, which take
 * precedence over the default level 'information'.
 *
 * Environment variables:
 *
 * - `COG_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
 *   'info', ...).
 * - `COG_LOG_FILE`: The file path to write logs to (if specified).
 */
export function createLoggerProvider(
    options: Partial<PinoLoggerProviderOptions> = {}
  ): LoggerProvider
{
  const builder =
    new PinoLoggerProviderOptionsBuilder()
    .fromEnvironmentVariables('COG_LOG_');

  if (options.file) {
    builder.withFile(
      options.file);
  }

  if (options.level) {
    builder.withLevel(
      options.level);
  }

  const providerOptions =
    builder.build();

  const provider =
    new PinoLoggerProvider(
      providerOptions);

  return provider;
}
