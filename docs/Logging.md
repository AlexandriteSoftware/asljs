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
- `--logformat <format>` - `auto`, `json` or `pretty`; see
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

## Format

The same three formats apply to every target, console or file:

- `json` - one JSON object per line. For machines: hosting platforms, log
  collectors, `jq`, and replaying a log.
- `pretty` - one readable line per entry, coloured when the target is a
  terminal. For people.
- `auto` - the default. Picks one of the two by asking whether a person is
  watching the target:
  - stdout or stderr that is a terminal - `pretty`.
  - stdout or stderr that is not a terminal (a container, a hosting platform
    such as Azure App Service, a pipe, a redirect) - `json`.
  - a file - `json`.

`auto` looks at the target itself, through `isTTY` on that stream, rather than
guessing the environment from variables such as `CI`, `NODE_ENV` or
`KUBERNETES_SERVICE_HOST`. A service therefore writes JSON on its hosting
platform with no configuration, and the same service run from a terminal
prints readable lines.

Pass a format only to override `auto`:

- `--logformat pretty` with a file, to read the file directly instead of through
  a formatter.
- `--logformat pretty` under a tool that pipes output but is still read by a
  person, such as `concurrently` in a development script.
- `--logformat json` on a terminal, to see exactly what a log collector will
  receive.

Applications do not fix the format in code; that would take the choice away
from `auto` and from the person running the tool.

Planned in [logging-json-console-output][OUT]; today the console is always
pretty-printed, with colour codes even when stdout is not a terminal, and a file
is always JSON.

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
- The default format is `pretty` rather than `auto`, because a person reads
  test output even though the test runner pipes it. `<PREFIX>TEST_LOG_FORMAT`
  overrides it.

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
[FMT]: #format
[FLD]: ../tasks/logging-structured-fields-dropped.md
[LOG]: ../libs/logging/docs/Logging.md
[MCP]: ../tasks/mcp-server-transport.md
[OUT]: ../tasks/logging-json-console-output.md
[TLP]: ../tasks/logging-test-logger-provider.md
