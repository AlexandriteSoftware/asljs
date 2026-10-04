# logging-structured-fields-dropped

Fields passed after the message are silently dropped, and the `Logger`
interface has no way to attach structured data to an entry.

Package: `logging`.

## The problem

`Logger` methods take `(message, ...params)`, and `PinoLogger` forwards them as
`pino.info(message, ...params)`. Pino treats arguments after a string message
as `printf` values: without a `%o`/`%s` placeholder they are discarded. Checked
with pino 10:

```text
p.info('started', { port: 1 })   -> {"msg":"started"}
p.info({ port: 2 }, 'started')   -> {"port":2,"msg":"started"}
p.info('x %o', { port: 3 })      -> {"msg":"x {\"port\":3}"}
```

So a caller cannot write a structured log entry through the abstraction, which
is what a service needs for log queries (EdGames' API logs events such as
`service.listening` with `port`, `env` and `url` fields to Azure). Placeholders
keep the value but bake it into the message text, so it cannot be filtered or
aggregated, and the message differs per entry.

Errors have the same problem: `error(message, err)` drops the `Error`, stack
included.

Today's callers: about 207 log calls in 52 files under `apps/` and `libs/`,
roughly 117 of them with `%s`/`%o` placeholders (mostly `cog` and `part`). Any
new signature has to say what happens to them.

## How OpenTelemetry models it

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

## Alternatives

### A. Fields object first, message second

```ts
logger.information({ port, env }, 'service listening');
```

Pino and bunyan in JavaScript. The object is merged into the record; an `err`
key goes through the error serializer.

- Matches pino directly, so `PinoLogger` forwards without translation.
- Reads backwards to many people, and a string-first call still compiles and
  silently loses data, which is today's bug.

### B. Message first, fields object second

```ts
logger.information('service listening', { port, env });
```

Winston (the "meta" argument), consola, and many smaller JavaScript loggers.

- Reads naturally and keeps existing `information(message)` calls valid.
- Collides with today's printf placeholders: is the object a field set or the
  value for `%o`? It needs a rule, for example "an object is fields when the
  message has no placeholder left to fill", or dropping placeholders.

### C. Message template with named holes

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

### D. Key/value arguments

```go
slog.Info("service listening", "port", port, "env", env)
```

Go `log/slog` (pairs or typed `slog.Int` attributes), Python `structlog`
(`log.info("service listening", port=port)`), Rust `tracing`
(`info!(port, "service listening")`).

- Idiomatic where the language has keyword arguments or macros. In TypeScript,
  alternating pairs are untyped and easy to misalign; an object (B or C) is the
  JavaScript equivalent.

### E. Bound fields, for context shared by many entries

Every library above also has a way to attach fields once: pino and bunyan
`child({ requestId })`, winston `child`, slog `With`, structlog `bind`, .NET
`BeginScope`. Some add implicit context through `AsyncLocalStorage` (pino
`mixin`, LogTape `withContext`), which is how request ids reach code that has no
logger parameter. This is orthogonal to A to D, and `getLogger(context)`
already does it for the one `context` field.

### Errors

The common shapes:

- A dedicated parameter: .NET `LogError(exception, template, ...)`.
- A conventional key: pino `err`, OpenTelemetry `exception.*`.
- Detection: winston's `errors()` format picks an `Error` out of the arguments.

A dedicated, optional parameter on `warning` and `error` is the hardest to get
wrong, and maps to `err` in pino and to `exception.*` in OpenTelemetry.

## Most common choice

- In JavaScript: winston and pino are the two most used Node.js loggers.
  Winston (B, message first) has the larger install base; pino (A, fields
  first) is the usual choice for new services, and the default in Fastify.
  Templates (C) are rare in JavaScript, LogTape being the main example.
- Across languages: message plus structured fields is universal; templates (C)
  dominate .NET, key/value (D) dominates Go, Python and Rust. Bound or child
  loggers (E) exist everywhere.

## Proposal to evaluate

B or C with an object, plus E and a dedicated error parameter:

```ts
logger.information('service listening', { port, env });
logger.error('request failed', error, { method, path });
const requestLogger = logger.child({ requestId });
```

- If C, the message may contain `{name}` holes filled from the fields object,
  and the template is kept as a field (for example `msgTemplate`) so entries can
  be grouped by it.
- Decide what happens to `%s`/`%o`: rewrite the call sites, or keep printf
  support for a transition and remove it later.
- `PinoLogger` maps to `pino.info({ ...fields, err }, message)`; `NullLogger`
  takes the same signature.

Update `libs/logging/docs/Logging.md`, `docs/Logging.md` (the "Rules for code"
placeholder rule), `RQ002 logging public API` and `NullLogger`, and test that
fields and errors reach the output.

## Where

- `libs/logging/src/logger.ts`
- `libs/logging/src/pino-logger.ts`
- `libs/logging/src/null-logger.ts`
- call sites: `grep -rn "logger\.\(trace\|debug\|information\|warning\|error\)("`
  under `apps/` and `libs/`.
