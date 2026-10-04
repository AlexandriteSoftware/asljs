# logging-child-loggers

Attach fields once to a logger, so every entry it writes carries them.

Package: `logging`.

Entries now take a leading fields object (see `libs/logging/docs/Logging.md`,
"Writing an entry"), which replaced the old behaviour of dropping fields passed
after the message. What is still missing is the bound form: a request id, a job
id or a tenant that every entry in a unit of work should carry, without
repeating it on each call.

`LoggerProvider.getLogger(context)` already binds one field, `context`.

Proposed:

- `Logger.child(fields)` returns a logger whose entries include `fields`, merged
  under the fields of each call. `PinoLogger` maps it to pino's `child()`.
- `NullLogger.child()` returns a `NullLogger`. `NullLogger` already has an
  unused `scope()` that returns one; replace it, or remove it.
- Decide whether implicit context through `AsyncLocalStorage` (pino `mixin`,
  LogTape `withContext`) is wanted, so a request id reaches code that has no
  logger parameter. It is a separate decision from `child()`.

Adding `child` to the `Logger` interface breaks hand-written implementations,
such as the recording logger in `libs/tmpdir/src/tmp-dir.test.ts`; make it
optional, or update them.

Update `libs/logging/docs/Logging.md` and `RQ002 logging public API`, and test
that bound fields reach the output and that call fields win on a clash.

## Background

How other libraries attach structured data to log entries, collected when the
fields-first form (A, with a fallback for B-shaped calls) was chosen.

### How OpenTelemetry models it

The OpenTelemetry log data model, which the JavaScript packages
`@opentelemetry/api-logs` and `@opentelemetry/sdk-logs` implement, separates
the parts of an entry:

- `body` - the message. Usually a string, but may be any value.
- `attributes` - a flat map of named values, the structured fields. Keys follow
  the semantic conventions where one exists (`http.request.method`,
  `server.port`, `user.id`).
- `severityNumber` and `severityText` - the level. The numbers group into
  TRACE, DEBUG, INFO, WARN, ERROR and FATAL ranges, which map onto this
  package's levels.
- `eventName` - in recent versions of the data model, a name that identifies
  the kind of event, such as `service.listening`.
- `traceId`, `spanId` - filled from the active context, so a log entry links to
  the trace it happened in.
- `resource` and instrumentation scope - who emitted it (service name, version,
  host), set once per provider rather than per entry.

Errors are attributes with conventional names: `exception.type`,
`exception.message` and `exception.stacktrace`.

In JavaScript, the Logs API (`logger.emit({ body, attributes, severityNumber,
... })`) is meant for bridges, not for application code. The intended setup is
an ordinary logging library plus an instrumentation that forwards its records:
`@opentelemetry/instrumentation-pino` (and the winston and bunyan equivalents)
injects `trace_id` and `span_id` into each pino record and can send records to
the OpenTelemetry SDK, mapping pino's message to `body` and its merged fields to
`attributes`.

What follows for this package: if entries carry a message plus a flat fields
object, and errors as a separate value, they map onto OpenTelemetry without
loss, through pino and the existing instrumentation.

### Alternatives

#### A. Fields object first, message second

```ts
logger.information({ port, env }, 'service listening');
```

Pino and bunyan in JavaScript. The object is merged into the record; an `err`
key goes through the error serializer.

- Matches pino directly, so `PinoLogger` forwards without translation.
- Reads backwards to many people, and a string-first call compiles and, in
  pino, silently loses the object. This package merges such an object into the
  fields instead.

#### B. Message first, fields object second

```ts
logger.information('service listening', { port, env });
```

Winston (the "meta" argument), consola, and many smaller JavaScript loggers.

- Reads naturally and keeps existing `information(message)` calls valid.
- Collides with today's printf placeholders: is the object a field set or the
  value for `%o`? It needs a rule, for example "an object is fields when the
  message has no placeholder left to fill", or dropping placeholders.

#### C. Message template with named holes

```ts
logger.information('Listening on {port} in {env}', { port, env });
```

.NET `ILogger` and Serilog (`LogInformation("Listening on {Port}", port)`,
values matched to holes by position), NLog, and in JavaScript LogTape
(`logger.info("Listening on {port}", { port })`).

- The template is constant across entries, so it identifies the event; the
  rendered text is readable; the values stay structured. .NET's OpenTelemetry
  exporter keeps the template as the `{OriginalFormat}` attribute next to the
  rendered body.
- This package's level names (`information`, `warning`) already follow .NET.
- Needs a small renderer, and the `%s` call sites are rewritten to named holes.

#### D. Key/value arguments

```go
slog.Info("service listening", "port", port, "env", env)
```

Go `log/slog` (pairs or typed `slog.Int` attributes), Python `structlog`
(`log.info("service listening", port=port)`), Rust `tracing`
(`info!(port, "service listening")`).

- Idiomatic where the language has keyword arguments or macros. In TypeScript,
  alternating pairs are untyped and easy to misalign; an object (B or C) is the
  JavaScript equivalent.

#### E. Bound fields, for context shared by many entries

Every library above also has a way to attach fields once: pino and bunyan
`child({ requestId })`, winston `child`, slog `With`, structlog `bind`, .NET
`BeginScope`. Some add implicit context through `AsyncLocalStorage` (pino
`mixin`, LogTape `withContext`), which is how request ids reach code that has no
logger parameter. This is orthogonal to A to D, and `getLogger(context)`
already does it for the one `context` field.

#### Errors

The common shapes:

- A dedicated parameter: .NET `LogError(exception, template, ...)`.
- A conventional key: pino `err`, OpenTelemetry `exception.*`.
- Detection: winston's `errors()` format picks an `Error` out of the arguments.

A dedicated, optional parameter on `warning` and `error` is the hardest to get
wrong, and maps to `err` in pino and to `exception.*` in OpenTelemetry.

### Most common choice

- In JavaScript: winston and pino are the two most used Node.js loggers.
  Winston (B, message first) has the larger install base; pino (A, fields
  first) is the usual choice for new services, and the default in Fastify.
  Templates (C) are rare in JavaScript, LogTape being the main example.
- Across languages: message plus structured fields is universal; templates (C)
  dominate .NET, key/value (D) dominates Go, Python and Rust. Bound or child
  loggers (E) exist everywhere.

## Where

- `libs/logging/src/logger.ts`
- `libs/logging/src/pino-logger.ts`
- `libs/logging/src/null-logger.ts`
