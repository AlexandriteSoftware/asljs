# Logging

## Purpose

How applications, tools, libraries and tests in this repository log, which
arguments and environment variables control logging, and the rules code follows
when it writes a log entry. The API of the logging package itself is in
[asljs-logging][LOG].

Some of the behaviour below is not implemented everywhere yet. Where that is
the case, the rule names the task that brings the code in line.

## Default: silent

An application or tool writes no log entries unless asked to. With no
arguments and no environment variables, nothing is logged, to the console or
anywhere else.

Logging is a diagnostic channel that a user switches on. It is not how a tool
talks to its user: results, progress a user is meant to see, and error messages
for the user are the tool's output, written to stdout or stderr directly, not
through a `Logger`.

## Enabling logging

Every application and tool takes the same two arguments:

- `--loglevel <level>` - enables logging at that level, to the console.
- `--logfile <path>` - writes the log to that file instead of the console. The
  directory is created if needed. Without `--loglevel`, the level is
  `information`.

So:

- If you want to watch what a tool does, then pass `--loglevel debug`.
- If the console is not the place for it, because the tool's stdout is its
  output or because you want to keep the log, then add `--logfile <path>`.

Each argument has an environment variable, named after the application:

- `<APP>_LOG_LEVEL` - the level, for example `PART_LOG_LEVEL`.
- `<APP>_LOG_FILE` - the file, for example `PART_LOG_FILE`.

An argument takes precedence over its environment variable, which takes
precedence over the default.

The prefixes in use:

- `cog` - `COG_LOG_`
- `kb` - `KB_LOG_`
- `part` - `PART_LOG_`
- `toolkit` - `TOOLKIT_LOG_`
- `asljs-logging` used directly, without a prefix of its own - `ASLJS_LOG_`

Bringing every application to this default is
[logging-apps-console-output-rule][APP].

## Levels

From the most to the least verbose:

- `trace` - every call with its arguments. Enough to reproduce what happened.
- `debug` - the steps of an operation and the decisions taken, without bulk
  data.
- `information` - events an operator of a running service wants to see:
  started, listening, stopped, a job completed.
- `warning` - something unexpected that the code recovered from.
- `error` - a failure the code handled and could not recover from.
- `silent` - nothing.

Any other name is rejected. `info` and `warn` are pino's names, not these.

## Console format

On the console, entries are pretty-printed for a person when stdout is a
terminal, and written as JSON lines when it is not: a container, a hosting
platform, a pipe or a redirect. `<APP>_LOG_FORMAT` set to `pretty` or `json`
overrides the choice. A log file always holds JSON lines.

Planned in [logging-json-console-output][OUT]; today the console is always
pretty-printed, with colour codes even when stdout is not a terminal.

## Tools whose stdout is their output

A tool whose stdout carries data, such as a printed file, a generated document,
`--format json` output, or a protocol, still follows the rule: `--loglevel`
alone logs to the console and mixes log entries into the output. That is the
user's choice; `--logfile` is the way to log without it.

MCP servers are the exception that cannot rely on the user: a log line on a
stdio server's stdout breaks the protocol. Until
[mcp-server-transport][MCP] settles how they communicate, an MCP server logs
only to a file, and `--loglevel` without `--logfile` leaves it silent.

## Tests

Tests log by default, because a failing test is when the log is needed:

- The default level is `debug`, written to the console.
- `<PREFIX>TEST_LOG_LEVEL` changes the level; `silent` turns logging off.
- `<PREFIX>TEST_LOG_FILE` writes the log to a file instead of the console.
- The console format is pretty, because a person reads test output, even though
  the test runner pipes it.

Inside this repository the prefix is `ASLJS_`:

```pwsh
$env:ASLJS_TEST_LOG_LEVEL = 'trace'
$env:ASLJS_TEST_LOG_FILE = 'build/test.log'
npm -w asljs-part run test
```

A test file creates one provider at module level, hands loggers to the code
under test, and disposes the provider in `test.after`. A project that uses
asljs packages uses its own prefix, for example `EDG_TEST_LOG_`.

Planned in [logging-test-logger-provider][TLP]; today tests construct
`NullLoggerProvider` and log nothing.

## Rules for code

- A library takes a `Logger` from its caller and never creates a provider. When
  the caller gives none, it uses a `NullLogger`, as `TmpDir` does.
- An application creates one `LoggerProvider` at its entry point, hands
  `getLogger(context)` to the parts it builds, and disposes the provider before
  it exits, so buffered entries are flushed. That includes exits from fatal
  error handlers.
- The context names the component, for example `TmpDir`, `cog.mcp` or `http`.
- A handled failure is logged once, where it is handled. Do not log an
  exception and rethrow it; whoever handles it logs it.
- An exception nobody handles is not logged. Node prints it to stderr and exits
  with code 1.
- Never log secrets: tokens, passwords, keys, cookies, connection strings.
- Do not log file content or other bulk data above `trace`.
- Build expensive messages only when the level is enabled:
  `if (logger.isLevelEnabled('trace')) { ... }`.
- Pass values as placeholders (`'%s'`, `'%o'`), not by concatenation, so the
  message text stays the same across entries. Structured fields are planned in
  [logging-structured-fields-dropped][FLD]; until then, an object passed after
  the message without a placeholder is dropped.

[APP]: ../tasks/logging-apps-console-output-rule.md
[FLD]: ../tasks/logging-structured-fields-dropped.md
[LOG]: ../libs/logging/docs/Logging.md
[MCP]: ../tasks/mcp-server-transport.md
[OUT]: ../tasks/logging-json-console-output.md
[TLP]: ../tasks/logging-test-logger-provider.md
