# logging-json-console-output

There is no way to write JSON lines to standard output.

Package: `logging`.

`PinoLoggerProvider` has two outputs: a file (JSON lines) when `file` is set,
and `pino-pretty` with colours otherwise. A hosted service wants the third:
JSON lines on stdout, which hosting platforms collect and index (Azure App
Service log stream and Application Insights, containers, systemd). Colourised
pretty output is unreadable there.

EdGames' API keeps a hand-written `logging.ts` for this reason alone.

Proposed:

- An option, for example `format: 'pretty' | 'json'` (default `pretty`), or a
  reserved `file` value such as `stdout`. `pino/file` already accepts file
  descriptor `1` as its destination.
- The matching environment variable, `<prefix>FORMAT`, in
  `fromEnvironmentVariables()`.
- Optional base fields (`service`, `env`) written on every record, since
  `base: null` drops pino's defaults.

## Where

- `libs/logging/src/pino-logger-provider.ts`
- `libs/logging/src/pino-logger-provider-options.ts`
- `libs/logging/docs/Logging.md`
