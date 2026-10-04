# Logging

## Purpose

The public surface of `asljs-logging`: the logging abstractions, the Pino-based
provider and how it is configured, and the null implementations.

## Package exports

- `Logger` - type. A logger bound to one context.
- `LoggerProvider` - type. Creates loggers and owns the resources behind them.
- `PinoLoggerProvider` - a `LoggerProvider` backed by [Pino][PIN].
- `PinoLoggerProviderOptions` - type. The provider's options.
- `PinoLoggerProviderOptionsBuilder` - builds `PinoLoggerProviderOptions`.
- `NullLogger` and `NullLoggerProvider` - implementations that discard every
  message.

## Logger

- `level` - the level the logger was created with.
- `isLevelEnabled(level)` - whether a message at `level` would be written.
- `trace(message, ...params)`, `debug(...)`, `information(...)`, `warning(...)`
  and `error(...)` - write a message at that level.

## Levels

From the most to the least verbose: `trace`, `debug`, `information`, `warning`,
`error`. `silent` writes nothing. Any other level name throws in the options
builder.

## LoggerProvider

- `getLogger(context?)` - returns a logger whose messages carry `context`.
- `dispose()` and `[Symbol.asyncDispose]()` - flush and release the output, so a
  provider can be declared with `await using`.

## PinoLoggerProvider

`new PinoLoggerProvider(options)` takes `PinoLoggerProviderOptions`:

- `level` - the minimum level written. Defaults to `silent` when the option is
  absent.
- `file` - a file path. When set, messages are written to that file, creating
  its directory if needed. When absent, messages are pretty-printed to the
  console.

## PinoLoggerProviderOptionsBuilder

The builder starts from level `information` and no file.

- `withLevel(level)` - sets the level. Throws for an unknown level name.
- `withFile(file)` - sets the output file.
- `fromEnvironmentVariables(prefix?)` - reads the level and file from
  environment variables, and keeps the current value for a variable that is
  unset.
- `build()` - returns the options.

## Environment variables

`fromEnvironmentVariables()` reads variables prefixed with `ASLJS_LOG_` by
default; pass another prefix to use your own:

- `<prefix>LEVEL` - the level. An unknown level name throws.
- `<prefix>FILE` - the output file path.

## Null implementations

`NullLoggerProvider` returns a `NullLogger`, which accepts every call and writes
nothing. Use them where a component needs a logger and the caller has none to
give.

[PIN]: https://getpino.io/
