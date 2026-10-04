# API reference

## Purpose

The complete public surface of `asljs-eventful`: what each export does, what it
returns, when it refuses, and what happens when a listener throws.

## Package exports

The package root exports:

- `eventful`
- `EventfulBase`
- `isEventfulLike`, `asEventfulLike`
- `ListenerError`
- `instanceId`, `getCurrentMessageContext`, `runInMessageContext`
- TypeScript types: `EventfulLike`, `EventName`, `EventMap`, `Eventful`,
  `EventfulFactory`, `EventfulFn`, `EventfulOptions`, `GlobalEvents`,
  `Listener`, `ListenerErrorArgs`, `MessageContext`, `ErrorFn` and `TraceFn`

`instanceId`, the message context functions and the package-level global emitter
are covered in [global-events.md](global-events.md). Typing patterns are covered
in [typescript.md](typescript.md).

## Stable behavior

These behaviors are part of the supported contract, not just current examples:

- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, `has`,
  `removeAllListeners` and `getListeners`
- `eventful` also acts as a package-level global emitter
- strict mode propagates listener errors
- non-strict mode isolates listener failures through the configured error path;
  a failure that no `error` hook and no package-level `error` listener consumed
  is rethrown from a microtask, so it surfaces as an unhandled error instead of
  disappearing
- a listener subscribed or removed during `emit` takes effect on the next emit,
  not the one in progress
- `ListenerError` protects against recursive failures in global error handling

## eventful([target], [options])

Adds event methods to `target` and returns it. If no target is provided, a new
empty object is created.

- `target` (Object | Function): The object to be enhanced.
- `options` (Object): Configuration options.
  - `error` (Function | null): Optional error hook called with `{ error, object,
    event, listener }`.
  - `trace` (Function | null): Optional trace hook called with `(action,
    payload)`. See [global-events.md](global-events.md) for the actions and
    payloads.
  - `strict` (Boolean): If true, propagates listener errors; otherwise they are
    isolated. Defaults to false.

Refuses, leaving the target untouched, when:

- the target is neither an object nor a function (`TypeError: Expect an object
  or a function.`)
- the target cannot take new properties, because it is frozen, sealed or had
  extensions prevented (`TypeError: Expect an extensible object or function, but
  the object is frozen.`)
- the target already has one of the methods that would be added (`Error: Method
  "on" already exists.`)

## EventfulBase([options])

A base class whose constructor calls `eventful(this, options)`. Takes the same
options as `eventful`. In TypeScript, pass the event map as the type argument:
`class Counter extends EventfulBase<CounterEvents>`.

## Methods

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

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful();

obj.once(
  'tick',
  n => console.log('first only', n)
);

obj.emit('tick', 1); // logs
obj.emit('tick', 2); // no-op; already unsubscribed

// Output:
// first only 1
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

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful();

const off = obj.on('e', () =>
{});

console.log(obj.has('e'));
off();
console.log(obj.has('e'));

// Output:
// true
// false
```

### removeAllListeners()

Removes every listener of every event. Returns `true` if any were removed.

Intended for an object you own and are discarding: dropping the listeners in one
step releases whatever their closures hold, and stops an emit that is still in
flight from reaching a subscriber that has already been torn down.

```
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

```
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
[leak-detection.md](leak-detection.md).

## Listener errors

By default a listener that throws does not stop the emit: the remaining
listeners still run, and the failure is reported.

Custom error handler for listener errors:

```js
import {
  eventful
} from 'asljs-eventful';

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

Every listener failure is also emitted as a package-level `error` event, see
[global-events.md](global-events.md).

A failure that neither an `error` hook nor a package-level `error` listener
consumed is rethrown from a microtask, so it surfaces as an unhandled error
instead of disappearing.

Strict mode propagates listener errors. `emit` rethrows the first listener
error, and the listeners after it do not run. `emitAsync` rejects with the first
rejection. The `error` hook and the package-level `error` event still receive
the failure before it propagates:

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful(
  {},
  { strict: true }
);
```

## Compatibility checks

- `isEventfulLike(value)` returns `true` when `value` is an object or function
  with an `on` method. It checks shape only, so any emitter with a compatible
  `on` passes.
- `asEventfulLike(value)` returns `value` typed as `EventfulLike` when it passes
  that check, otherwise `undefined`.
