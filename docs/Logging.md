# Logging

## Purpose

How applications, tools, libraries and tests in this repository log, which
arguments and environment variables control logging, and the rules code follows
when it writes a log entry. The API of the logging package itself is in
[asljs-logging][LOG].

## Default: silent

An application or tool writes no log entries unless asked to. With no
arguments and no environment variables, nothing is logged, to the console or
anywhere else.

Logging is a diagnostic channel that a user switches on. It is not how a tool
talks to its user: results, progress a user is meant to see, and error messages
for the user are the tool's output, written to stdout or stderr directly, not
through a `Logger`.

## Enabling logging

Every application and tool takes the same three arguments:

- `--loglevel <level>` - enables logging at that level. Without `--logfile`,
  the log goes to the console (stdout).
- `--logfile <target>` - where the log goes. Without `--loglevel`, the level is
  `information`. The target is one of:
  - a path - the log is written to that file; its directory is created if
    needed.
  - `stdout` - the console. The same as leaving `--logfile` out: the log is
    written once, to stdout.
  - `stderr` - standard error, which keeps stdout free for the tool's output.
- `--logformat <format>` - `auto`, `json`, `text` or `pretty`; see
  [Format][FMT]. Defaults to `auto`.

So:

- If you want to watch what a tool does, then pass `--loglevel debug`.
- If stdout is not the place for it, because it carries the tool's output, then
  add `--logfile stderr`.
- If you want to keep the log, then add `--logfile <path>`.

Each argument has an environment variable, named after the application:

- `<APP>_LOG_LEVEL` - the level, for example `PART_LOG_LEVEL`.
- `<APP>_LOG_FILE` - the target, for example `PART_LOG_FILE=stderr`.
- `<APP>_LOG_FORMAT` - the format, for example `PART_LOG_FORMAT=json`.

An argument takes precedence over its environment variable, which takes
precedence over the default.

The prefixes in use:

- `cog` - `COG_LOG_`
- `kb` - `KB_LOG_`
- `part` - `PART_LOG_`
- `toolkit` - `TOOLKIT_LOG_`
- `asljs-logging` used directly, without a prefix of its own - `ASLJS_LOG_`

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

## Format

Four formats:

- `json` - one JSON object per line. For machines: hosting platforms, log
  collectors, `jq`, and replaying a log. Any target.
- `text` - one readable line per entry, plain text without colour codes. For
  people reading a file or a captured stream. Any target.
- `pretty` - the same line as `text`, coloured. For people at a terminal. Only
  stdout and stderr: `pretty` with a file path throws at startup, because colour
  codes in a file are noise; use `text` there.
- `auto` - the default. Picks by asking whether a person is watching the
  target:
  - stdout or stderr that is a terminal - `pretty`.
  - stdout or stderr that is not a terminal (a container, a hosting platform
    such as Azure App Service, a pipe, a redirect) - `json`.
  - a file - `json`.

`auto` looks at the target itself, through `isTTY` on that stream, rather than
guessing the environment from variables such as `CI`, `NODE_ENV` or
`KUBERNETES_SERVICE_HOST`. A service therefore writes JSON on its hosting
platform with no configuration, and the same service run from a terminal
prints readable lines.

`pretty` on stdout or stderr that is not a terminal is allowed: some tools that
pipe output still show it to a person and pass colours through.

Pass a format only to override `auto`:

- `--logformat text` with a file, to read the file directly instead of through
  a formatter.
- `--logformat pretty` under a tool that pipes output but shows it to a person
  with colours, such as `concurrently` in a development script; `text` if it
  does not pass colours through.
- `--logformat json` on a terminal, to see exactly what a log collector will
  receive.

Applications do not fix the format in code; that would take the choice away
from `auto` and from the person running the tool.

## Tools whose stdout is their output

A tool whose stdout carries data, such as a printed file, a generated document
or `--format json` output, still follows the rule: `--loglevel` alone logs to
stdout and mixes log entries into the output. That is the user's choice;
`--logfile stderr` or `--logfile <path>` keeps the output clean.

MCP servers cannot leave that choice to the user: a log line on a stdio
server's stdout breaks the protocol. So an MCP server:

- stays silent when no level is given, like every tool;
- throws at startup when a level is given and the target is stdout, whether
  `--logfile` is left out or set to `stdout`, with a message that names
  `--logfile stderr` and `--logfile <path>` as the alternatives;
- logs normally to `stderr` or to a file. MCP clients read a server's stderr
  and show or record it, so `--logfile stderr` is the way to watch an MCP
  server.

Protecting the protocol from output that does not come from the logger, such as
`console.log` in a dependency, is [mcp-server-transport][MCP].

## Tests

Tests log by default, because a failing test is when the log is needed:

- The default level is `debug`, written to the console.
- `<PREFIX>TEST_LOG_LEVEL` changes the level; `silent` turns logging off.
- `<PREFIX>TEST_LOG_FILE` takes the same targets as `--logfile`: a path,
  `stdout` or `stderr`.
- The default format is `pretty` on stdout or stderr rather than `auto`,
  because a person reads test output even though the test runner pipes it, and
  `json` in a file, since `pretty` is not allowed there.
  `<PREFIX>TEST_LOG_FORMAT` overrides it.

Inside this repository the prefix is `ASLJS_`:

```pwsh
$env:ASLJS_TEST_LOG_LEVEL = 'trace'
$env:ASLJS_TEST_LOG_FILE = 'build/test.log'
npm -w asljs-part run test
```

A test file creates one provider at module level with
`createTestLoggerProvider()`, hands loggers to the code under test, and
disposes the provider in `test.after`. A project that uses asljs packages
passes its own prefix, for example `createTestLoggerProvider('EDG_TEST_LOG_')`.

## Rules for code

- A library takes a `Logger` from its caller and never creates a provider. When
  the caller gives none, it uses a `NullLogger`, as `TmpDir` does.
- An application creates one `LoggerProvider` at its entry point with
  `createLoggerProvider('<APP>_LOG_', readLoggerOptions(argv))`, passing
  `{ allowStdout: false }` when its stdout carries a protocol. It hands
  `getLogger(context)` to the parts it builds, and awaits `dispose()` before it
  exits, so buffered entries are written. That includes exits from fatal error
  handlers.
- The context names the component, for example `TmpDir`, `cog.mcp` or `http`.
- A handled failure is logged once, where it is handled. Do not log an
  exception and rethrow it; whoever handles it logs it.
- An exception nobody handles is not logged. Node prints it to stderr and exits
  with code 1.
- Never log secrets: tokens, passwords, keys, cookies, connection strings.
- Do not log file content or other bulk data above `trace`.
- Build expensive messages only when the level is enabled:
  `if (logger.isLevelEnabled('trace')) { ... }`.
- Keep the message the same across entries and put the values in fields:
  `logger.information({ port, env }, 'listening')`. Placeholders (`'%s'`,
  `'%o'`) are fine for values that only make the text readable; never build a
  message by concatenation. Pass an error first, or as `err`:
  `logger.error(error, 'request failed')`. See [Writing an entry][ENT].

[FMT]: #format
[ENT]: ../libs/logging/docs/Logging.md#writing-an-entry
[LOG]: ../libs/logging/docs/Logging.md
[MCP]: ../tasks/mcp-server-transport.md
