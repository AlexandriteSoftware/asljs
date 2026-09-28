# Forwarding eventful traces to OpenTelemetry

`eventful` records who sent a message and what caused it. That is enough to
render a sequence diagram locally, and enough to hand the same information to
OpenTelemetry when something outside the process needs to consume it.

This is a worked example, not a dependency. `eventful` does not depend on
OpenTelemetry, and nothing here changes if you never adopt it.

## What maps onto what

OpenTelemetry standardises the two halves separately, and neither half was
designed for object instances, so the mapping is a choice rather than a
specification:

- A message becomes a **span**. `messageId` is the natural span name suffix, and
  the span covers the dispatch of that message to its listeners.
- `causationId` becomes the **parent span**. This is the whole reason causation
  is recorded: a parent link is what turns a flat list into a tree.
- `correlationId` becomes the **trace id**, since a trace is exactly the set of
  spans belonging to one interaction.
- `id`, the instance identity, becomes a **span attribute**. There is no
  standard attribute for an application object, so pick a namespace of your own
  and stay consistent.

The messaging semantic conventions are the closest published fit for the
attribute names. Borrowing them buys recognition in existing trace viewers:

- `messaging.message.id` for `messageId`
- `messaging.destination.name` for the event name
- `messaging.operation.name` for `emit` or `emitAsync`

The instance identity has no equivalent, so it stays custom. `eventful.emitter`
is used below.

## A minimal exporter

The trace hook receives everything needed. Keep a map from `messageId` to the
span so a caused message can find its parent.

```js
import {
  context,
  SpanKind,
  trace
} from '@opentelemetry/api';
import {
  eventful
} from 'asljs-eventful';

const tracer = trace.getTracer('asljs-eventful');

const spansByMessageId = new Map();

function traceToOtel(action, payload)
{
  if (action !== 'emit' && action !== 'emitAsync') {
    return;
  }

  const parentSpan = payload.causationId === null
    ? undefined
    : spansByMessageId.get(payload.causationId);

  const parentContext = parentSpan === undefined
    ? context.active()
    : trace.setSpan(context.active(), parentSpan);

  const span = tracer.startSpan(
    `${payload.id} ${String(payload.event)}`,
    {
      kind: SpanKind.PRODUCER,
      attributes: {
        'eventful.emitter': payload.id,
        'eventful.correlation_id': payload.correlationId,
        'messaging.message.id': payload.messageId,
        'messaging.destination.name': String(payload.event),
        'messaging.operation.name': action,
        'messaging.listener.count': payload.listeners.length
      }
    },
    parentContext
  );

  spansByMessageId.set(payload.messageId, span);

  span.end();
}

const cart = eventful(new Cart(), { trace: traceToOtel });
```

## Running it without a backend

`@opentelemetry/sdk-trace-node` with `ConsoleSpanExporter` is enough to see the
result, with no collector and no service to send anything to. It is the fastest
way to check that the causation chain really does become a span tree.

```js
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor
} from '@opentelemetry/sdk-trace-node';

const provider = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())]
});

trace.setGlobalTracerProvider(provider);

// ... emit as usual, then:
await provider.forceFlush();
```

Running the exporter above against `cart.emit('checkout')`, where the checkout
listener emits `stocked` on a basket, prints two spans:

```
traceId:           32c99ff710f26fbd96133a8f10100b05
name:              'Cart#1 checkout'
id:                cfff4535fec1e82a
parentSpanContext: undefined
  eventful.emitter        'Cart#1'
  messaging.message.id    'm5'

traceId:           32c99ff710f26fbd96133a8f10100b05
name:              'Basket#1 stocked'
id:                57b45bbb460a2802
parentSpanContext: { spanId: 'cfff4535fec1e82a', ... }
  eventful.emitter        'Basket#1'
  messaging.message.id    'm7'
```

Both spans share one trace, and the second names the first as its parent. That
is the causation chain, expressed in OpenTelemetry's own terms.

Two details the output makes obvious. Message ids are not `m1` and `m2`, because
the counter is process wide and `eventful` emits internally before any of this
runs; treat the values as opaque. And `service.name` reads
`unknown_service:node.exe` until a resource is configured, which is worth doing
before any of this reaches a real backend.

## Three things this example gets wrong on purpose

It is short enough to read, which means it is not production code.

- **The span ends immediately.** A real span should stay open for the duration
  of the dispatch, so its duration means something. The trace hook fires before
  listeners run and is not called again afterwards, so covering the dispatch
  needs the emit to be wrapped rather than observed. Ending the span at once
  gives a correct tree with meaningless durations.
- **`spansByMessageId` never shrinks.** It is a leak. Bound it by correlation,
  and drop a correlation once its root message has been dispatched.
- **Only the producer side exists.** The conventions describe a producer span
  and a consumer span per listener. `eventful` does not report listener entry
  and exit, so there is nothing to hang consumer spans on without wrapping
  listeners in `on`.

## When to do this at all

Not by default. The ids are useful on their own: a structured log of
`{ id, event, messageId, correlationId, causationId }` is already a graph, and
rendering it as a mermaid sequence diagram takes a few lines. That costs no
dependency and no per-event allocation, which matters for a library that runs in
a browser.

Reach for OpenTelemetry when something outside the process has to consume the
trace, or when these events need to sit in the same view as HTTP and database
spans from the rest of a system. Then the cost buys real interoperability.

## Rendering without OpenTelemetry

The same payloads produce a sequence diagram directly:

```js
const lines = ['sequenceDiagram'];

function traceToMermaid(action, payload)
{
  if (action !== 'emit' && action !== 'emitAsync') {
    return;
  }

  const from = payload.causationId === null
    ? 'caller'
    : emitterByMessageId.get(payload.causationId) ?? 'caller';

  emitterByMessageId.set(payload.messageId, payload.id);

  lines.push(`  ${from}->>${payload.id}: ${String(payload.event)}`);
}
```

Participants are the instance identities, arrows are the causation chain, and
one diagram per `correlationId` is one interaction.
