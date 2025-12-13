# eventful

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

Lightweight event helper adding on/off/emit to any object.

## Installation

```bash
npm install asljs-eventful
```

## Usage

### Basic Example

```js
import { eventful } from 'asljs-eventful';

const obj = eventful({ name: 'Alice' });
obj.on('greet', msg => console.log(`${msg}, ${obj.name}!`));
obj.emit('greet', 'Hello'); // Logs: "Hello, Alice!"
```

### Advanced Options

Trace event invocations to console:

```js
const obj =
  eventful(
    { },
    { trace:
        (action, payload) => {
          console.log(
            `Action: ${action}`,
            payload);
        } });

// Tracing actions include:
// - 'new' on creation: payload { object }
// - 'on' when subscribing: payload { object, event, listener }
// - 'off' when unsubscribing: payload { object, event, listener }
// - 'emit' for sync emit: payload { object, event, args, listeners }
// - 'emitAsync' for async emit: payload { object, event, args, listeners }
```

Custom error handler for listener errors:

```js
const obj =
  eventful(
    { },
    { error:
        ({ error, object, event, listener }) => {
          console.error(
            `Error in listener for event "${event}"`,
            error);
        } });
```

Strict mode to propagate listener errors:

```js
const obj =
  eventful(
    { },
    { strict: true });
```

### Global Events

`eventful` is also a global emitter. When you create an enhanced object via `eventful(target, options)`, its lifecycle and actions are traced via the per-instance `trace` hook and also emitted as global events on `eventful`.

```js
const offNew =
  eventful.on(
    'new',
    ({ object }) => {
      console.log('created', object);
    });

const offError =
  eventful.on(
    'error',
    ({ error, object, event }) => {
      console.error('listener error', event, error);
    });

// Later
offNew();
offError();
```

Note: if a **global** `eventful.on('error', ...)` listener throws, `eventful` throws a `ListenerError` (an `Error` subclass with fields `{ error, object, event, listener }`) to avoid an infinite error loop.

## API

### eventful([target], [options])

Wraps the `target` object with event capabilities. If no target is provided,
a new empty object is created.

- `target` (Object): The object to be enhanced with event capabilities.
- `options` (Object): Configuration options.
  - `error` (Function | null): Optional error hook called with `{ error, object, event, listener }`.
  - `trace` (Function | null): Optional trace hook called with `(action, payload)`.
  - `strict` (Boolean): If true, propagates listener errors; otherwise they
    are isolated. Defaults to false.

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
  n => console.log('first only', n));

obj.emit('tick', 1); // logs
obj.emit('tick', 2); // no-op; already unsubscribed
```

### off(event, listener)

Removes a listener for the specified event.

- `event` (String | Symbol): The event name.
- `listener` (Function): The callback function to be removed.

### emit(event, ...args)

Emits the specified event, invoking all registered listeners with the provided
arguments.

- `event` (String | Symbol): The event name.
- `...args` (Any): Arguments to pass to the listeners.

### emitAsync(event, ...args)

Emits the specified event asynchronously, running listeners in parallel.
In non-strict mode, all listeners run and rejections are isolated; in strict
mode, the first rejection causes the returned promise to reject.

- `event` (String | Symbol): The event name.
- `...args` (Any): Arguments to pass to the listeners.

Returns a Promise that resolves when all listeners have been invoked.

### has(event)

Checks if there are any listeners registered for the specified event.

- `event` (String | Symbol): The event name.

Returns `true` if there are listeners, otherwise `false`.

Example:

```js
const off =
  obj.on('e', () => {});

console.log(obj.has('e')); // true
off();
console.log(obj.has('e')); // false
```

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
