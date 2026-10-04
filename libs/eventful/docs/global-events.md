# Global events and tracing

## Purpose

How to observe emitters from the outside: the package-level emitter that sees
every enhanced object, the per-object `trace` hook, and the identities that make
a trace readable.

## The package-level emitter

`eventful` is not only an object enhancer. The package-level `eventful` function
is also an emitter. When you create an enhanced object via
`eventful(target, options)`, its lifecycle and actions are reported to the
per-instance `trace` hook and also emitted as global events on `eventful`.

```js
import {
  eventful
} from 'asljs-eventful';

const offNew = eventful.on(
  'new',
  ({ object }) =>
  {
    console.log('created', object);
  }
);

const offError = eventful.on(
  'error',
  ({ error, object, event }) =>
  {
    console.error('listener error', event, error);
  }
);

// Later
offNew();
offError();
```

In TypeScript the payloads are checked: the exported `GlobalEvents` map
declares the arguments of `new`, `on`, `off`, `emit`, `emitAsync` and `error`,
and `EventfulFn` is the type of `eventful` itself. See
[typescript.md][TPE].

Reporting is gated: an object without a `trace` hook reports an action only
while a global listener for that action exists, so an unused stream costs
nothing.

If a **global** `eventful.on('error', ...)` listener throws, `eventful` throws a
`ListenerError` (an `Error` subclass with fields
`{ error, object, event, listener }`) to avoid an infinite error loop.

A global listener that performs the action it is listening for, on an enhanced
object, recurses until the stack ends. A listener for `emit` that emits on an
enhanced object is traced in turn, which calls the listener again. The same
holds for a listener for `on` that subscribes. This is not guarded, for the same
reason a function that calls itself is not: read from the payload rather than
acting on it, and where a listener has to act, emit on `eventful` itself, which
is not re-broadcast. `GlobalEvents` leaves room for such an event: a name it
does not declare is accepted, with `unknown[]` arguments. The
[leak detection][LKD] recipes take the first route, and only read.

## The trace hook

Trace event invocations for one object:

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful(
  {},
  {
    trace: (action, payload) =>
    {
      console.log(
        `Action: ${action}`,
        payload
      );
    }
  }
);
```

Actions and payloads:

- `new` on creation, `{ object }`
- `on` when subscribing, `{ object, event, listener }`
- `off` when unsubscribing, `{ object, event, listener }`
- `emit` for sync emit, `{ object, event, args, listeners }`
- `emitAsync` for async emit, `{ object, event, args, listeners }`

Every payload also carries `id`, the emitter identity. `emit` and `emitAsync`
payloads also carry `messageId`, `correlationId` and `causationId`.

Every subscription and every removal is reported, whichever path it took, and
only removals that actually removed something, so a count of `on` against `off`
stays balanced.

## Instance identity and message context

A trace is only readable if you can tell who sent what, and what caused it.
Every trace payload carries the identity of the object it came from, and every
emit carries the identity of the message.

### instanceId(object)

Returns a stable `<Type>#<n>` identifier for an instance, assigning one on first
use. Instances are held weakly, so identifying one does not keep it alive.

```js
import {
  eventful,
  instanceId
} from 'asljs-eventful';

class Cart
{}

const cart = eventful(new Cart());

console.log(instanceId(cart));

// Output:
// Cart#1
```

### Message context

Each emit is a message with three ids:

- `messageId` identifies this message.
- `correlationId` is shared by every message in one interaction.
- `causationId` is the message whose dispatch caused this one, or null when the
  message starts an interaction.

The ids are opaque. The counter is process wide, so do not depend on particular
values or on a message being the first one.

A message emitted by a listener is caused by the message being dispatched, and
joins its correlation, so a chain of events is recoverable from the trace alone:

```
cart.on('checkout', () => basket.emit('stocked'));

cart.emit('checkout');
// emit  Cart#1   checkout  { messageId: A, correlationId: A, causationId: null }
// emit  Basket#1 stocked   { messageId: B, correlationId: A, causationId: A }
```

### getCurrentMessageContext() and runInMessageContext(context, fn)

`getCurrentMessageContext` returns the message being dispatched on this call
stack, or null outside a dispatch.

The context is ambient on the call stack, so it reaches emits a listener makes
synchronously. A listener that emits _after awaiting_ has already left that
stack, and its message starts a new correlation. To keep the chain across an
await, capture the context and restore it:

```
cart.on('checkout', async () =>
{
  const context = getCurrentMessageContext();

  await settle();

  runInMessageContext(context, () => basket.emit('stocked'));
});
```

For a worked example of forwarding these ids to OpenTelemetry, see
[opentelemetry.md][OTL].

[LKD]: leak-detection.md
[OTL]: opentelemetry.md
[TPE]: typescript.md#the-package-level-emitter
