# logging-json-console-output

Implement the log targets and formats described in `docs/Logging.md`, so that
a service writes JSON lines without configuration, a person at a terminal gets
readable output, and any target can carry either format.

Package: `logging`.

`PinoLoggerProvider` has two fixed combinations today: a file path gets JSON
lines through `pino/file`, and no file gets colourised `pino-pretty` on stdout,
with colour codes even when stdout is a pipe or a file. A process in a container
or on a hosting platform (Azure App Service, Kubernetes, systemd) has no one
reading its console; the platform collects stdout and indexes it, and pretty
output is unreadable there. EdGames' API keeps a hand-written `logging.ts` for
this reason alone.

Logs are one channel. An `error` entry is a log entry, not an application
failure, and goes where every other entry goes.

## Targets

`file` in the options, and `<prefix>FILE`, take:

- a path - a file, created with its directory if needed.
- `stdout` - the same as no file: written once, to stdout. Not a second
  destination.
- `stderr` - standard error.

`pino/file` accepts file descriptors 1 and 2 as destinations, and `pino-pretty`
takes a `destination` option, so both formats can reach every target.

A file literally named `stdout` or `stderr` is written as `./stdout`.

## Format

`format` in the options, and `<prefix>FORMAT`, take `auto` (the default),
`json` or `pretty`, for any target:

- `auto` on stdout or stderr - `pretty` when that stream's `isTTY` is true,
  `json` when it is not.
- `auto` on a file - `json`.
- `pretty` writes colour only when the target is a terminal.

The automatic choice answers the real question, whether a person is watching
the target, without guessing the platform from variables such as `CI`,
`NODE_ENV`, `KUBERNETES_SERVICE_HOST` or `WEBSITE_SITE_NAME`. With no terminal
it gives JSON, which also suits `node app | pino-pretty`, the workflow pino
recommends.

Applications should not fix the format in code: that overrides the automatic
choice and leaves the environment variable and `--logformat` as the only way
back. If the options builder gets a `withFormat()`, document it for tests and
special cases.

Cases to keep in mind:

- A development script that runs the service through `concurrently`, or any
  other tool that pipes output, sees no terminal and gets JSON. The script sets
  `<prefix>FORMAT=pretty`; that is what the variable is for.
- `docker run -t` allocates a terminal and gets pretty output, which is right:
  someone is watching. Kubernetes and App Service do not allocate one.
- `node --test` pipes the test processes, so `auto` would give JSON. Tests
  default to `pretty` instead, see `logging-test-logger-provider`.
- CI logs are JSON unless the job sets the variable.

## Writing to stdout is a decision the caller can refuse

An MCP server must not log to stdout, and `docs/Logging.md` says it throws at
startup when a level is given with stdout as the target. Give the options or
the factory a way to state that, for example `allowStdout: false`, which makes
the resolved options throw with a message naming `--logfile stderr` and
`--logfile <path>`. The check happens when the provider is built, before the
server reads its first message.

## Failures nobody handled

Not the logger's concern. Code that catches an exception and logs it has
handled it. An exception that escapes to the top level is printed to stderr by
Node, which exits with code 1. Do not log and rethrow, or the failure is
reported twice.

A service's top-level `uncaughtException` and `unhandledRejection` handlers
count as handling: they log to the log channel. Pino writes through a worker
thread, so the last entries before the process exits can be lost. The provider
must offer a synchronous flush, and the documentation must say to call it before
exiting on a fatal error. `dispose()` already calls `flushSync()`; check that it
is enough when called from those handlers.

## Also

- Optional base fields (`service`, `env`) written on every record, since
  `base: null` drops pino's defaults.
- Read `<prefix>FORMAT` in `fromEnvironmentVariables()` with the other two
  variables, and accept `--logformat` wherever `--loglevel` and `--logfile` are
  read (cog's `readLoggerOptions`, see `logging-shared-provider-factory`).
- Update `libs/logging/docs/Logging.md` and `RQ002 logging public API`, remove
  the "planned" notes from `docs/Logging.md`, and test every target and format
  pair, with fake streams that are and are not a TTY.

Bringing the existing applications in line with `docs/Logging.md` is
[logging-apps-console-output-rule][APP].

## Where

- `libs/logging/src/pino-logger-provider.ts` - the output selection.
- `libs/logging/src/pino-logger-provider-options.ts` - the options and the
  environment variables.
- `libs/logging/docs/Logging.md`

[APP]: logging-apps-console-output-rule.md
