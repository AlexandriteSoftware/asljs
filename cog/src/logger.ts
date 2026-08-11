import { createPinoLoggerProvider,
         type Logger,
         type LoggerOptions,
         type LoggerProvider,
         NullLoggerProvider }
  from 'asljs-logging';

/**
 * Creates a logger provider with the specified options.
 *
 * If options are not provided, tries to initialise from environment variables.
 * If no environment variables are set, defaults to level 'silent'.
 *
 * Environment variables:
 *
 * - `COG_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
 *   'info', ...).
 * - `COG_LOG_FILE`: The file path to write logs to (if specified).
 */
export function createLoggerProvider(
    options: Partial<LoggerOptions> = {}
  ): LoggerProvider
{
  const level =
    options.level
    ?? process.env.COG_LOG_LEVEL
    ?? 'silent';

  const file =
    options.file === null
    ? undefined
    : options.file
      ?? process.env.COG_LOG_FILE
      ?? undefined;

  const loggerOptions: Partial<LoggerOptions> =
    { level,
      file,
      envVarPrefix: 'COG_LOG_' };

  if (level === 'silent') {
    return new NullLoggerProvider();
  }

  return createPinoLoggerProvider(
    loggerOptions);
}
