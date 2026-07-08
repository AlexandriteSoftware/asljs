# RQ131 CLI Logging

Logging is disabled by default. The parameter `--log` enables logging with
the default log level of `information`.

The parameter `--loglevel` allows specifying the log level. The log level can
be specified as a full name or an alias. The log level is case-insensitive.

The log levels are as follows, in order of increasing severity:

- `trace` - the most detailed log level, inclues method entry and exit logs, and
  detailed information about the execution flow.
- `debug` - includes detailed information about the execution flow, but does not
  include method entry and exit logs.
- `information` - includes high-level information about the execution flow.
- `warning` - includes information about potential issues that may affect
  the execution.
- `error` - includes information about errors that occurred during execution.

Logs can be redirected to a file using the `--logfile` parameter, which
specifies the path to the log file.

Example:

```text
executable action --log --loglevel debug --logfile path/to/logfile.log
```

The logging API is similar to other logging frameworks:

```js
logger.trace('This is a trace log');
logger.debug('This is a debug log');
logger.information('This is an information log');
logger.warning('This is a warning log');
logger.error('This is an error log');
```
