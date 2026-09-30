# eventful

> Part of [Alexandrite Software Library][#1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

Adds `on`, `once`, `off`, `emit` and `emitAsync` to any object, class instance
or function, so it can raise its own events.

```js
import {
  eventful
} from 'asljs-eventful';

const obj = eventful({ name: 'Alice' });

obj.on('greet', msg => console.log(`${msg}, ${obj.name}!`));

obj.emit('greet', 'Hello'); // writes "Hello, Alice!"
```

## Scope

Direct, named events on your own objects, with the class hierarchy left to you.

- **Any object.** Enhance an object you already have, extend `EventfulBase`, or
  call `eventful(this)` in a constructor.
- **Typed events.** In TypeScript, event names and listener arguments are
  checked against an event map you declare.
- **Isolated listener failures.** By default a throwing listener is reported and
  the other listeners still run. Strict mode propagates the error instead.
- **One place to watch every emitter.** Every enhanced object also reports to a
  package-level emitter, for tracing, logging, or finding leaked subscriptions.
- **Small.** Zero dependencies.

Out of scope:

- DOM `EventTarget` semantics: bubbling, capture, and `preventDefault`.
- Wildcard event names.
- Emit flow control through listener return values.

## Installation

```bash
npm install asljs-eventful
```

NPM Package: [asljs-eventful](https://www.npmjs.com/package/asljs-eventful)

Ships as an ES module with TypeScript declarations.

## Usage

A class with typed events:

```ts
import {
  EventfulBase
} from 'asljs-eventful';

type CounterEvents = { changed: [value: number]; };

class Counter extends EventfulBase<CounterEvents>
{
  value = 0;

  increment()
  {
    this.value++;
    this.emit('changed', this.value);
  }
}

const counter = new Counter();

const off = counter.on('changed', value => console.log(value.toFixed(0)));

counter.increment(); // writes "1"

off();
```

`on` and `once` return a function that removes the listener.

Which form to pick:

- If you are adding events to a plain object, then use `eventful(target)`.
- If you control the class hierarchy, then extend `EventfulBase`.
- If the class already extends something else, then call `eventful(this)` in the
  constructor.

## Further reading

- [API reference](docs/api.md) — every function, method and option, and what
  happens when a listener throws.
- [TypeScript](docs/typescript.md) — event maps, and typing classes and plain
  objects.
- [Global events and tracing](docs/global-events.md) — watching every emitter,
  instance identity, and message correlation ids.
- [Detecting leaked subscriptions](docs/leak-detection.md).
- [Forwarding traces to OpenTelemetry](docs/opentelemetry.md).

Questions and bugs:
[asljs/issues](https://github.com/AlexandriteSoftware/asljs/issues).

## Related packages

- If you need property change tracking, see `asljs-observable`.
- If you need DOM binding built on observable state, see `asljs-data-binding`.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
