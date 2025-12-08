# eventful

> Part of [Alexantrite Software Library][#1] - a set of high-quality and
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
    { trace: (object, action, payload) =>
        console.log(
          `Action: ${action}`,
          payload) });

// Tracing actions include:
// - 'new' on creation: payload { object }
// - 'on' when subscribing: payload { event, listener }
// - 'off' when unsubscribing: payload { event, listener }
// - 'emit' for sync emit: payload { event, args, listeners }
// - 'emitAsync' for async emit: payload { event, args, listeners }
```

Custom error handler for listener errors:

```js
const obj =
  eventful(
    { },
    { error: (err, { object, event, listener }) =>
        console.error(
          `Error in listener for event "${event}"`,
          err) });
```

Strict mode to propagate listener errors:

```js
const obj =
  eventful(
    { },
    { strict: true });
```

Change the error handler or trace function globally:

```js
eventful.options.trace =
  (object, action, payload) =>
    console.log(
      `Action: ${action}`,
      payload);

eventful.options.error =
  (err, { object, event, listener }) =>
    console.error(
      `Error in listener for event "${event}"`,
      err);
```

## API

### eventful([target], [options])

Wraps the `target` object with event capabilities. If no target is provided, a new empty object is created.

- `target` (Object): The object to be enhanced with event capabilities.
- `options` (Object): Configuration options.
  - `error` (Function): Custom error handler for listener errors `(err, { object, event, listener })`.
  - `trace` (Function): Custom trace hook `(object, action, payload)` for `new`, `on`, `off`, `emit`, `emitAsync`.
  - `strict` (Boolean): If true, propagates listener errors; otherwise they are isolated. Defaults to false.

### on(event, listener)

Registers a listener for the specified event.

- `event` (String): The event name.
- `listener` (Function): The callback function to be invoked when the event is emitted.

Returns a function to remove the listener.

### once(event, listener)

Registers a one-time listener for the specified event. The listener is removed after its first invocation.

- `event` (String): The event name.
- `listener` (Function): The callback function to be invoked when the event is emitted.

Returns a function to remove the listener.

### off(event, listener)

Removes a listener for the specified event.

- `event` (String): The event name.
- `listener` (Function): The callback function to be removed.

### emit(event, ...args)

Emits the specified event, invoking all registered listeners with the provided arguments.

- `event` (String): The event name.
- `...args` (Any): Arguments to pass to the listeners.

### emitAsync(event, ...args)

Emits the specified event asynchronously, running listeners in parallel. In non-strict mode, all listeners run and rejections are isolated; in strict mode, the first rejection causes the returned promise to reject.

- `event` (String): The event name.
- `...args` (Any): Arguments to pass to the listeners.

Returns a Promise that resolves when all listeners have been invoked.

### has(event)

Checks if there are any listeners registered for the specified event.

- `event` (String): The event name.

Returns `true` if there are listeners, otherwise `false`.

## License

MIT License. See [LICENSE](LICENSE) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
