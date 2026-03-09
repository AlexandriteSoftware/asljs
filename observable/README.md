# observable

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

## Overview

Lightweight observable for JS. Emits events on property changes via on/off/emit.
Works with objects, arrays, and primitives.

## Installation

```bash
npm install asljs-observable
```

NPM Package: [asljs-observable](https://www.npmjs.com/package/asljs-observable)

## Usage

### Observing an object (JavaScript)

```js
import { observable } from 'asljs-observable';

const obj = observable({ a: 1, b: 2 });

obj.on('set:a', ({ value, previous }) => {
  console.log(`obj.a ←`, value, '(was', previous, ')');
});

obj.on('set', ({ property, value, previous }) => {
  console.log(`obj.${property} ←`, value, '(was', previous, ')');
});

obj.a = 3;
```

### Observing an array (JavaScript)

```js
import { observable } from 'asljs-observable';

const arr = observable([1, 2, 3]);

arr.on('set:1', ({ value, previous }) => {
  console.log('arr[1] ←', value, '(was', previous, ')');
});

arr.on('set', (payload) => {
  if ('index' in payload) {
    console.log(`arr[${payload.index}] ←`, payload.value, '(was', payload.previous, ')');
    return;
  }

  console.log(`arr.${payload.property} ←`, payload.value, '(was', payload.previous, ')');
});

arr[1] = 42;
```

### Observing a number (JavaScript)

```js
import { observable } from 'asljs-observable';

const box = observable(10);

box.on('set', ({ value, previous }) => {
  console.log('value:', previous, '→', value);
});

box.value = 11;
```

### Watch selected properties (JavaScript)

```js
import { observable } from 'asljs-observable';

const state = observable({ user: 'Alice', active: false });

// logs "User: Alice Active: false"
state.watch(
  [ 'user', 'active' ],
  (user, active) =>
    console.log('User:', user, 'Active:', active));

// logs "User: Alice Active: true"
state.active = true;
```

### Watching an object's property (TypeScript)

```ts
import { observable, type Observable } from 'asljs-observable';

const obj: Observable<{ name: string }> =
  observable({ name: 'Alice' });

obj.watch(
  'name',
  name => console.log(name));
```

### Observable class (TypeScript)

```ts

import { ObservableObjectBase } from 'asljs-observable';

class User
  extends ObservableObjectBase<{ name: string }>
{
  #name: string;

  constructor(name: string) {
    super();

    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set name(value: string) {
    this.setAndEmit(
      'name',
      this.#name,
      value,
      next => {
        this.#name = next;
      });
  }
}
```

## API Reference

### `observable(value, [options])`

Wraps an object, array, or primitive to make it observable.

- `value`: Target object/array/primitive to observe.
- `options.eventful` (optional): Custom `eventful` factory (defaults to `asljs-eventful`).
- `options.trace` (optional): Trace hook `(object, action, payload)` invoked on `'new'`, `'set'`, `'delete'`, `'define'`.

Returns the original value wrapped with Eventful API and change notifications.
When the target object does not already have a `watch` method, observable adds a
non-enumerable `watch(properties, callback)` method to the wrapped object.

### `observable.watch(target, properties, callback)`

Watches the selected properties and invokes callback with their current values.

- Runs the callback immediately with current values.
- Re-runs callback each time one of the selected `set:<property>` events fires.
- `target` must be eventful (`on` method available).
- Arrays are not supported by `watch` yet and will throw `TypeError`.
- Returns an unsubscribe function. Calling it removes all listeners attached by
  this `watch` call.

### Events and payloads

More concrete events are emitted first, followed by more generic ones.
E.g., setting `obj.a` emits `set:a` first, then `set`.

Objects emit:

- `set` and `set:<property>`: `{ property, value, previous }`
- `delete` and `delete:<property>`: `{ property, previous }`
- `define` and `define:<property>`: `{ property, descriptor, previous }`

For arrays:

- index changes (`arr[0] = x`, `delete arr[1]`) emit payloads with numeric
  `index`.
- non-index properties (including `'length'` and custom properties) emit
  payloads with string `property`.
- `define` / `define:<property>` are emitted only for non-index properties.

Primitives (boxed as `{ value }`) emit:

- `set` and `set:value`: `{ property: 'value', value, previous }`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
