import { type LoggerProvider,
         PinoLoggerProvider,
         type PinoLoggerProviderOptions,
         PinoLoggerProviderOptionsBuilder }
  from 'asljs-logging';

/**
 * Create a logger provider for the CLI and the MCP server.
 *
 * Explicit options take precedence over environment variables, which take
 * precedence over the default level.
 *
 * Environment variables:
 *
 * - `KB_LOG_LEVEL`: the logging level, for example 'silent', 'trace',
 *   'debug', 'information', 'warning', 'error'.
 * - `KB_LOG_FILE`: the file to write logs to.
 */
export function createLoggerProvider(
    options: Partial<PinoLoggerProviderOptions> = {}
  ): LoggerProvider
{
  const builder =
    new PinoLoggerProviderOptionsBuilder()
      .fromEnvironmentVariables('KB_LOG_');

  if (options.file) {
    builder.withFile(options.file);
  }

  if (options.level) {
    builder.withLevel(options.level);
  }

  return new PinoLoggerProvider(
    builder.build());
}
