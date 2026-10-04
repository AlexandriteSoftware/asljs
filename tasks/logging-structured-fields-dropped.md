# logging-structured-fields-dropped

Fields passed after the message are silently dropped.

Package: `logging`.

`Logger` methods take `(message, ...params)`, and `PinoLogger` forwards them as
`pino.info(message, ...params)`. Pino treats arguments after a string message
as `printf` values: without a `%o`/`%s` placeholder they are discarded. Checked
with pino 10:

```text
p.info('started', { port: 1 })   -> {"msg":"started"}
p.info({ port: 2 }, 'started')   -> {"port":2,"msg":"started"}
```

So a caller cannot write a structured log entry through the abstraction, which
is what a service needs for log queries (EdGames' API logs events such as
`service.listening` with `port`, `env` and `url` fields to Azure).

Options:

- An optional leading fields object, mirroring pino:
  `information(fields, message)`, detected the same way pino does.
- Merge trailing plain objects into the record in `PinoLogger`.
- A `child(fields)` on `Logger`, for fields shared by many entries (request id,
  service name). `LoggerProvider.getLogger(context)` already does this for the
  single `context` field.

Errors deserve the same care: `error(message, err)` drops the `Error` today.
Pino serializes an `err` key with its stack.

Update `docs/Logging.md`, `RQ002 logging public API` and `NullLogger` with the
new signature, and test that fields reach the output.

## Where

- `libs/logging/src/logger.ts`
- `libs/logging/src/pino-logger.ts`
- `libs/logging/src/null-logger.ts`
