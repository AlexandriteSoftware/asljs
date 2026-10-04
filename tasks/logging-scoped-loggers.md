# logging-scoped-loggers

Decide whether loggers get an ambient scope, so fields reach code that is not
given a scoped logger.

Package: `logging`.

`Logger.scope(fields)` exists (see `libs/logging/docs/Logging.md`, "Scopes"):
it returns a logger whose entries all carry `fields`, like pino's `child()`.
That covers every case where the scoped logger can be passed down. It does not
cover code that takes no logger, or takes one from elsewhere, during a request
or a job; such code logs without the request id.

The alternative is an ambient scope, tied to the async context rather than to
a logger object:

- .NET `ILogger.BeginScope(state)` - fields apply to every entry written,
  through any logger, until the returned scope is disposed.
- In JavaScript, built on `AsyncLocalStorage`: pino's `mixin` option adds
  fields from a store to every entry; LogTape's `withContext(fields, callback)`
  applies them for the duration of the callback.

A possible shape:
`loggerProvider.withScope({ requestId }, async () => { ... })`, with
`PinoLoggerProvider` reading the store in a pino `mixin`.

Points to settle:

- Whether the explicit `scope()` is enough. Prefer it while it is: an ambient
  scope is invisible at the call site, and its cost is paid on every entry.
- If ambient scopes are added, which wins on a clash between an ambient field,
  a `scope()` field and a call field; and that `NullLoggerProvider` accepts the
  same calls.
- Naming. "Scope" here means fields bound to entries, as in .NET.
  OpenTelemetry's "instrumentation scope" is something else: the name of the
  library that emitted a record. Say so wherever both appear.

## Background

How other libraries attach structured data to log entries, collected when the
fields-first form (A, with a fallback for B-shaped calls) was chosen. Bound
fields (E) are what `scope()` implements; most JavaScript libraries call them a
child logger.

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
