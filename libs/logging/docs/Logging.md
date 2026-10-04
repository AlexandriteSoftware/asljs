# Logging

## Purpose

The public surface of `asljs-logging`: the logging abstractions, the Pino-based
provider and how it is configured, and the null implementations.

## Package exports

- `Logger` - type. A logger bound to one context.
- `LogFields` - type. Named values written as fields of a log record.
- `LogEntryHead` - type. The first argument of a log method: a message, fields
  or an `Error`.
- `LoggerProvider` - type. Creates loggers and owns the resources behind them.
- `PinoLoggerProvider` - a `LoggerProvider` backed by [Pino][PIN].
- `PinoLoggerProviderOptions` - type. The provider's options.
- `PinoLoggerProviderOptionsBuilder` - builds `PinoLoggerProviderOptions`.
- `LogFormat` - type. `auto`, `json`, `text` or `pretty`.
- `createLoggerProvider`, `createTestLoggerProvider` and `readLoggerOptions` -
  create a provider by the repository's rules; with the `LoggerOverrides` and
  `LoggerProviderSettings` types.
- `NullLogger` and `NullLoggerProvider` - implementations that discard every
  message.

## Logger

- `level` - the level the logger was created with.
- `isLevelEnabled(level)` - whether a message at `level` would be written.
- `trace(...)`, `debug(...)`, `information(...)`, `warning(...)` and
  `error(...)` - write an entry at that level.

## Writing an entry

Every log method takes an optional leading fields object, then a message, then
the message's `printf` values:

```ts
logger.information('started');
logger.debug('found %d file(s) in %s', count, directory);
logger.information({ port, env }, 'listening on %s', url);
logger.trace({ step: 'scan' });
logger.error(error, 'request failed');
logger.error({ err: error, path }, 'request failed');
```

- Fields are merged into the record as named values, so a log query can filter
  and group by them. The message stays the same across entries.
- An `Error` in first place, or under the `err` key, is written as `err` with
  its type, message and stack.
- `printf` placeholders (`%s`, `%d`, `%i`, `%f`, `%j`, `%o`, `%O`) take the
  values after the message in order; `%%` is a literal `%`.
- Fields first is pino's own call shape, so `PinoLoggerProvider` passes it
  through unchanged and records map onto OpenTelemetry's `attributes` and `body`
  through pino's instrumentation.

Pino drops arguments that no placeholder consumes. So that a message-first call
does not lose data silently, `PinoLoggerProvider` merges any such plain object
into the record as fields, and takes such an `Error` as `err`:

```ts
logger.information('started', { port });   // {"port":8080,"msg":"started"}
```

Prefer the fields-first form in new code; the fallback exists for calls written
the other way round.

## Levels

From the most to the least verbose: `trace`, `debug`, `information`, `warning`,
`error`. `silent` writes nothing. Any other level name throws in the options
builder.

## LoggerProvider

- `getLogger(context?)` - returns a logger whose entries carry `context`.
- `dispose()` and `[Symbol.asyncDispose]()` - flush and close the output, and
  resolve once every entry is written, so a provider can be declared with
  `await using`. Call it before the process exits, including from fatal error
  handlers. Calling it again does nothing.

## Creating a provider

For an application, `createLoggerProvider(prefix, overrides?, settings?)`
applies the repository's rules (`docs/Logging.md` at the repository root):

- Silent unless a level or a target is given; a target without a level logs
  at `information`.
- `overrides` - `{ level, file, format }`, usually `readLoggerOptions(argv)`.
  Each one takes precedence over its environment variable.
- `settings.allowStdout: false` - for a process whose stdout carries a
  protocol, such as an MCP server: a level with stdout as the target throws.
- `settings.base` - fields written on every entry, such as `{ service }`.
- Returns a `NullLoggerProvider` when the level is `silent`, so a silent
  application starts no worker thread.

```ts
await using loggerProvider =
  createLoggerProvider(
    'MY_APP_LOG_',
    readLoggerOptions(process.argv));
```

`readLoggerOptions(argv)` reads `--loglevel`, `--logfile` and `--logformat`, in
the `--name value` and `--name=value` forms.

For a test file, `createTestLoggerProvider(prefix = 'ASLJS_TEST_LOG_')` logs at
`debug` to stdout by default, `pretty` on stdout and stderr and `json` in a
file; `<prefix>LEVEL`, `<prefix>FILE` and `<prefix>FORMAT` override it, and
`silent` returns a `NullLoggerProvider`.

```ts
const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());
```

## PinoLoggerProvider

`new PinoLoggerProvider(options)` takes `PinoLoggerProviderOptions`:

- `level` - the minimum level written. Defaults to `silent`, at which no
  worker thread is started and every logger is a `NullLogger`.
- `file` - the target: a file path (its directory is created if needed),
  `stdout` or `stderr`. Defaults to `stdout`.
- `format` - `auto` (the default), `json`, `text` or `pretty`:
  - `json` - one JSON object per line.
  - `text` - one readable line per entry, without colour codes.
  - `pretty` - `text` with colour codes, for stdout and stderr only.
  - `auto` - `pretty` when the target is a terminal stream, `json` for any
    other stream and for a file.
- `base` - fields written on every entry.
- `allowStdout` - `false` refuses stdout as the target unless the level is
  `silent`.

The constructor throws for `pretty` with a file path and for stdout when
`allowStdout` is `false`, so a misconfigured process fails at startup.

## PinoLoggerProviderOptionsBuilder

With nothing set, the builder builds level `silent`; with only a file set, it
builds level `information`.

- `withLevel(level)` - sets the level. Throws for an unknown level name.
- `withFile(file)` - sets the target: a file path, `stdout` or `stderr`.
- `withFormat(format)` - sets the format. Throws for an unknown format.
- `withBase(fields)` - sets the fields written on every entry.
- `withoutStdout()` - refuses stdout as the target.
- `fromEnvironmentVariables(prefix?)` - reads the level, target and format
  from environment variables, and keeps the current value for a variable that
  is unset.
- `build()` - returns the options, and throws for the same combinations as the
  provider.

## Environment variables

`fromEnvironmentVariables()` reads variables prefixed with `ASLJS_LOG_` by
default; pass another prefix to use your own:

- `<prefix>LEVEL` - the level. An unknown level name throws.
- `<prefix>FILE` - the target: a file path, `stdout` or `stderr`.
- `<prefix>FORMAT` - `auto`, `json`, `text` or `pretty`.

## Null implementations

`NullLoggerProvider` returns a `NullLogger`, which accepts every call and writes
nothing. Use them where a component needs a logger and the caller has none to
give.

[PIN]: https://getpino.io/
