# logging-json-console-output

Choose the log output and format so that a service writes JSON lines without
configuration, and a tool whose stdout is its output never logs to the console.

Package: `logging`.

`PinoLoggerProvider` has two outputs today: a file (JSON lines) when `file` is
set, and colourised `pino-pretty` on stdout otherwise. A process in a container
or on a hosting platform (Azure App Service, Kubernetes, systemd) has no one
reading its console; the platform collects stdout and indexes it, and pretty
output is unreadable there. EdGames' API keeps a hand-written `logging.ts` for
this reason alone.

## Model

Logs are one channel. An `error` entry is a log entry, not an application
failure, and goes where every other entry goes.

The application, not the user, decides whether it has console logging at all,
when it builds its provider:

- `console` - a service, or any application with no other use for stdout. Logs
  go to stdout, or to the file when `<prefix>FILE` is set.
- `file` - a tool whose stdout is its output: printed results, generated text,
  or a protocol such as an MCP server over stdio. Logs go to the file when
  `<prefix>FILE` is set, and nowhere otherwise. Log lines never mix into the
  output.

A file always receives JSON lines.

## Format on the console

When logs go to stdout, the format is chosen in this order:

1. `<prefix>FORMAT`, when set: `json`, `pretty` or `auto`.
2. Otherwise automatic: `pretty` when `process.stdout.isTTY` is true, `json`
   when it is not.

The automatic choice answers the real question, whether a person is watching,
without guessing the platform from variables such as `CI`, `NODE_ENV`,
`KUBERNETES_SERVICE_HOST` or `WEBSITE_SITE_NAME`. With no terminal it gives
JSON, which also suits `node app | pino-pretty`, the workflow pino recommends.

Applications should not fix the format in code: that overrides the automatic
choice and leaves the environment variable as the only way back. If the
options builder gets a `withFormat()`, document it for tests and special cases.

Cases to keep in mind:

- A development script that runs the service through `concurrently`, or any
  other tool that pipes output, sees no terminal and gets JSON. The script sets
  `<prefix>FORMAT=pretty`; that is what the variable is for.
- `docker run -t` allocates a terminal and gets pretty output, which is right:
  someone is watching. Kubernetes and App Service do not allocate one.
- `node --test` pipes the test processes, so test logging on the console is
  JSON. Test logging is off by default and usually goes to a file, see
  `logging-test-logger-provider`.
- CI logs are JSON unless the job sets the variable.

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
  variables.
- Update `docs/Logging.md` and `RQ002 logging public API`, and test the format
  choice with a fake stdout that is and is not a TTY.

Bringing the existing applications in line is
[logging-apps-console-output-rule][APP].

## Where

- `libs/logging/src/pino-logger-provider.ts` - the output selection.
- `libs/logging/src/pino-logger-provider-options.ts` - the options and the
  environment variables.
- `libs/logging/docs/Logging.md`

[APP]: logging-apps-console-output-rule.md
