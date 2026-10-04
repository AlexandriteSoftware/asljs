import { createLoggerProvider as createProvider,
         type LoggerOverrides,
         type LoggerProvider,
         type LoggerProviderSettings }
  from 'asljs-logging';

/**
 * Creates cog's logger provider, following `docs/Logging.md` at the repository
 * root: silent unless asked, with `--loglevel`, `--logfile` and `--logformat`
 * taking precedence over `COG_LOG_LEVEL`, `COG_LOG_FILE` and
 * `COG_LOG_FORMAT`.
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
    'COG_LOG_',
    options,
    settings);
}
