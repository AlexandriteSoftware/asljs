# eventful

> Part of [Alexandrite Software Library][#1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

Lightweight event helper adding on/off/emit to any object.

## Installation

```bash
npm install asljs-eventful
```

NPM Package: [asljs-eventful](https://www.npmjs.com/package/asljs-eventful)

## Public Exports

The package-root export surface includes:

- `eventful`
- `EventfulBase`
- `isEventfulLike`
- `asEventfulLike`
- `ListenerError`
- TypeScript types including `EventfulLike`, `EventName`, `EventMap`,
  `Eventful`, `EventfulFactory`, `EventfulOptions`, `Listener`,
  `ListenerErrorArgs`, `ErrorFn`, and `TraceFn`

## Usage

### Special Behavior

`eventful` is not only an object enhancer. The package-level `eventful` function
also acts as a global emitter for lifecycle and error events.

If you change lifecycle, tracing, or listener-error behavior, then preserve that
package-level emitter contract.

### Stable Behavior

These behaviors are part of the supported contract, not just current examples:

- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`
- `eventful` also acts as a package-level global emitter
- strict mode propagates listener errors
- non-strict mode isolates listener failures through the configured error path;
  a failure that no `error` hook and no package-level `error` listener consumed
  is rethrown from a microtask, so it surfaces as an unhandled error instead of
  disappearing
- a listener subscribed or removed during `emit` takes effect on the next emit,
  not the one in progress
- `ListenerError` protects against recursive failures in global error handling

### Preferred Patterns

- If you are enhancing a plain object, then use `eventful(target)`.
- If you are enhancing an existing class instance and cannot change inheritance,
  then call `eventful(this)` in the constructor.
- If you control a new class hierarchy and event support is part of the type
  design, then extend `EventfulBase`.
- If you are writing TypeScript and want typed listener signatures, then declare
  an event map and use the exported `Eventful<...>` types.

### Basic (JavaScript)

Adding events to an object, add listeners, and emit events:

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful({ name: 'Alice' });

obj.on('greet', msg => console.log(`${msg}, ${obj.name}!`));

// writes "Hello, Alice!" to console
obj.emit('greet', 'Hello');
```

### Basic (TypeScript)

```ts
import {
  type Eventful,
  eventful
} from 'asljs-eventful';

type Events = { greet: [msg: string]; };

const obj: { name: string; } & Eventful<Events> = eventful({ name: 'Alice' });

obj.on('greet', msg => console.log(`${msg}, ${obj.name}!`));

// writes "Hello, Alice!" to console
obj.emit('greet', 'Hello');
```

### Inheritance (JavaScript)

Adding events to a class via inheritance:

```js
import {
  EventfulBase
} from 'asljs-eventful';

class MyClass extends EventfulBase
{
  constructor(name)
  {
    super();

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

### Inheritance (TypeScript)

```ts
import {
  EventfulBase
} from 'asljs-eventful';

class MyClass extends EventfulBase
{
  name: string;

  constructor(name: string)
  {
    super();

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

### Construction (JavaScript)

Adding events to an existing class during construction:

```js
import {
  eventful
} from 'asljs-eventful';

export class MyClass
{
  constructor(name)
  {
    eventful(this);

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

### Construction (TypeScript)

```ts
import {
  type Eventful,
  eventful
} from 'asljs-eventful';

type MyClassEvents = { greet: [message: string]; };

export class MyClass implements Eventful<MyClassEvents>
{
  name: string;

  declare on: Eventful<MyClassEvents>['on'];
  declare once: Eventful<MyClassEvents>['once'];
  declare off: Eventful<MyClassEvents>['off'];
  declare emit: Eventful<MyClassEvents>['emit'];
  declare emitAsync: Eventful<MyClassEvents>['emitAsync'];
  declare has: Eventful<MyClassEvents>['has'];

  constructor(name: string)
  {
    eventful(this);

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

### Advanced Options

Trace event invocations to console:

```js
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

// Tracing (event, payload):
// - 'new' on creation, { object }
// - 'on' when subscribing, { object, event, listener }
// - 'off' when unsubscribing, { object, event, listener }
// - 'emit' for sync emit, { object, event, args, listeners }
// - 'emitAsync' for async emit, { object, event, args, listeners }
```

Custom error handler for listener errors:

```js
const obj = eventful(
  {},
  {
    error: ({ error, object, event, listener }) =>
    {
      console.error(
        `Error in listener for event "${event}"`,
        error
      );
    }
  }
);
```

Strict mode to propagate listener errors:

```js
const obj = eventful(
  {},
  { strict: true }
);
```

### Global Events

`eventful` is also a global emitter. When you create an enhanced object via
`eventful(target, options)`, its lifecycle and actions are traced via the
per-instance `trace` hook and also emitted as global events on `eventful`.

```js
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

Note: if a **global** `eventful.on('error', ...)` listener throws, `eventful`
throws a `ListenerError` (an `Error` subclass with fields
`{ error, object, event, listener }`) to avoid an infinite error loop.

Note: a global listener that performs the action it is listening for, on an
enhanced object, recurses until the stack ends. A listener for `emit` that emits
on an enhanced object is traced in turn, which calls the listener again. The
same holds for a listener for `on` that subscribes. This is not guarded, for the
same reason a function that calls itself is not: read from the payload rather
than acting on it, and where a listener has to act, emit on `eventful` itself,
which is not re-broadcast. The leak detection recipes take the first route, and
only read.

## API

### eventful([target], [options])

Wraps the `target` object with event capabilities. If no target is provided, a
new empty object is created.

- `target` (Object): The object to be enhanced with event capabilities.
- `options` (Object): Configuration options.
  - `error` (Function | null): Optional error hook called with
    `{ error, object, event, listener }`.
  - `trace` (Function | null): Optional trace hook called with
    `(action, payload)`. Every payload carries `id`, the emitter identity;
    `emit` and `emitAsync` payloads also carry `messageId`, `correlationId` and
    `causationId`. Every subscription and every removal is reported, whichever
    path it took, and only removals that actually removed something, so a count
    of `on` against `off` stays balanced.
  - `strict` (Boolean): If true, propagates listener errors; otherwise they are
    isolated. Defaults to false.

Refuses, leaving the target untouched, when:

- the target is neither an object nor a function
  (`TypeError: Expect an object or a function.`)
- the target cannot take new properties, because it is frozen, sealed or had
  extensions prevented
  (`TypeError: Expect an extensible object or function, but the object is
  frozen.`)
- the target already has one of the methods that would be added
  (`Error: Method "on" already exists.`)

### on(event, listener)

Registers a listener for the specified event.

- `event` (String | Symbol): The event name.
- `listener` (Function): The callback function to be invoked when the event is
  emitted.

Returns a function to remove the listener.

### once(event, listener)

Registers a one-time listener for the specified event. The listener is removed
after its first invocation.

- `event` (String | Symbol): The event name.
- `listener` (Function): The callback function to be invoked when the event is
  emitted.

Returns a function to remove the listener.

Example:

```js
obj.once(
  'tick',
  n => console.log('first only', n)
);

obj.emit('tick', 1); // logs
obj.emit('tick', 2); // no-op; already unsubscribed
```

### off(event, [listener])

Removes a listener for the specified event. A listener registered with `once` is
removed by passing the same function that was given to `once`.

Called without a listener, removes every listener of that event.

- `event` (String | Symbol): The event name.
- `listener` (Function, optional): The callback function to be removed. Omit to
  remove all listeners of the event.

Returns `true` if a listener was removed, otherwise `false`.

The bulk form removes listeners other code registered, not only your own. Use it
on an object you own. To detach from an object you were handed, call the
unsubscribe function that `on` returned.

### removeAllListeners()

Removes every listener of every event. Returns `true` if any were removed.

Intended for an object you own and are discarding: dropping the listeners in one
step releases whatever their closures hold, and stops an emit that is still in
flight from reaching a subscriber that has already been torn down.

```js
class Machine
{
  dispose()
  {
    for (const state of this.states) {
      state.removeAllListeners();
    }

    this.removeAllListeners();
  }
}
```

On an object you did not create, unsubscribe your own listeners instead. This
removes everyone's.

### getListeners()

Returns a snapshot of what is currently subscribed: a `Map` from each event that
has listeners to an array of those listeners, in the order they were added.

The map and its arrays are copies, so changing them changes nothing. A listener
registered with `once` appears as the function you passed to `once`, not as the
wrapper that removes it.

```js
const counts = [...obj.getListeners()].map(
  ([event, listeners]) => `${String(event)}: ${listeners.length}`
);

// [ 'set: 12', 'delete: 12', 'define: 12' ]
```

Twelve listeners on an event nobody expected twelve subscribers for is the
signature of subscriptions that were never removed. The function identities name
the culprit: the same handler appearing many times is one subscriber that
re-subscribed without detaching.

The snapshot holds every listener, and so everything those closures hold. Read
it and drop it; keeping it alive keeps them alive.

For two worked recipes built on this and on the global event stream, an
in-flight guard and a snapshot inspector, see
[docs/leak-detection.md](docs/leak-detection.md).

### emit(event, ...args)

Emits the specified event, invoking all registered listeners with the provided
arguments. The listener set is captured before dispatch, so subscribing or
unsubscribing from inside a listener affects the next emit rather than the one
in progress.

- `event` (String | Symbol): The event name.
- `...args` (Any): Arguments to pass to the listeners.

Returns `true` if the event had at least one listener, otherwise `false`.

### emitAsync(event, ...args)

Emits the specified event asynchronously, running listeners in parallel. In
non-strict mode, all listeners run and rejections are isolated; in strict mode,
the first rejection causes the returned promise to reject.

- `event` (String | Symbol): The event name.
- `...args` (Any): Arguments to pass to the listeners.

Returns a Promise that resolves when all listeners have been invoked. The
resolved value is `true` if the event had at least one listener, otherwise
`false`.

### has(event)

Checks if there are any listeners registered for the specified event.

- `event` (String | Symbol): The event name.

Returns `true` if there are listeners, otherwise `false`.

Example:

```js
const off = obj.on('e', () =>
{});

console.log(obj.has('e')); // true
off();
console.log(obj.has('e')); // false
```

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

instanceId(cart); // 'Cart#1'
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

```js
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

```js
cart.on('checkout', async () =>
{
  const context = getCurrentMessageContext();

  await settle();

  runInMessageContext(context, () => basket.emit('stocked'));
});
```

For a worked example of forwarding these ids to OpenTelemetry, see
[docs/opentelemetry.md](docs/opentelemetry.md).

## License

MIT License. See [LICENSE](LICENSE.md) for details.

## Related Packages

- If you need property change tracking, see `asljs-observable`.
- If you need DOM binding built on observable state, see `asljs-data-binding`.

[#1]: https://github.com/AlexandriteSoftware/asljs
