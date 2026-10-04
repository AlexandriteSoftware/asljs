# logging-silent-provider-starts-transport

A `PinoLoggerProvider` at level `silent` still starts a transport worker.

Package: `logging`.

The constructor always calls `pino.transport(...)`, which starts a worker
thread (`pino-pretty` or `pino/file`), even when the level means nothing will
be written. `silent` is the default level, and the natural setting for tests,
so every test file that builds a provider pays a worker start and must dispose
it, or the process can hang on the open worker.

Options:

- Skip the transport when the level is `silent` and use a no-op destination.
- Or have the options builder, or a factory, return a `NullLoggerProvider` for
  `silent`, see [logging-shared-provider-factory][FAC].

## Where

- `libs/logging/src/pino-logger-provider.ts` - the constructor.

[FAC]: logging-shared-provider-factory.md
