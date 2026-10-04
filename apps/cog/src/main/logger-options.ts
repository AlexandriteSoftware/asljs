/**
 * Logging is configured before commander parses argv, so `--loglevel`,
 * `--logfile` and `--logformat` are read directly.
 */
export {
  readLoggerOptions
} from 'asljs-logging';
