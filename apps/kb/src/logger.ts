import { createLoggerProvider as createProvider,
         type LoggerOverrides,
         type LoggerProvider,
         type LoggerProviderSettings }
  from 'asljs-logging';

/**
 * Creates kb's logger provider, following `docs/Logging.md` at the repository
 * root: silent unless asked, with `--loglevel`, `--logfile` and `--logformat`
 * taking precedence over `KB_LOG_LEVEL`, `KB_LOG_FILE` and `KB_LOG_FORMAT`.
 *
 * The MCP server passes `{ allowStdout: false }`, because its stdout carries
 * the protocol.
 */
export function createLoggerProvider(
    options: LoggerOverrides = {},
    settings: LoggerProviderSettings = {}
  ): LoggerProvider
{
  return createProvider(
    'KB_LOG_',
    options,
    settings);
}
