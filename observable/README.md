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

## Usage

Object example:

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

Array example:

```js
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

Primitive example:

```js
const box = observable(10);

box.on('set', ({ value, previous }) => {
  console.log('value:', previous, '→', value);
});

box.value = 11;
```

Watch helper example:

```js
const state = observable({ firstName: 'Ada', lastName: 'Lovelace', age: 36 });

observable.watch(
  state,
  [ 'firstName', 'lastName' ],
  (firstName, lastName) => {
    console.log('Name:', firstName, lastName);
  }
);
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

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
