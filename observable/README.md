# observable

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

Lightweight observable for JS. Emits events on property changes via on/off/emit.
Works with objects, arrays, and primitives.

## Install

```bash
npm install asljs-observable
```

## Usage

Object example:

```js
import { observable } from 'asljs-observable';

const obj = observable({ a: 1, b: 2 });

obj.on('set', ({ property, value, previous }) => {
  console.log('set', property, previous, '→', value);
});

obj.on('set:a', ({ value }) => {
  console.log('a changed to', value);
});

obj.a = 3;
```

Array example:

```js
const arr = observable([1, 2, 3]);
arr.on('set:1', ({ value, previous }) => {
  console.log('index 1:', previous, '→', value);
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

## API

### `observable(value, [options])`

Wraps an object, array, or primitive to make it observable.

- `value`: Target object/array/primitive to observe.
- `options.eventful` (optional): Custom `eventful` factory (defaults to `asljs-eventful`).
- `options.eventfulOptions` (optional): Options passed to the underlying `eventful` wrapper.
- `options.trace` (optional): Trace hook `(object, action, payload)` invoked on `'new'`, `'set'`, `'delete'`, `'define'`.

Returns the original value wrapped with Eventful API and change notifications.

### Events and payloads

Objects emit:

- `set` and `set:<prop>`: `{ property, value, previous }`
- `delete` and `delete:<prop>`: `{ property, previous }`
- `define` and `define:<prop>`: `{ property, descriptor, previous }`

Arrays emit (no `define`):

- `set` / `set:<index>` and `set:length`
- `delete` / `delete:<index>`

Primitives (boxed as `{ value }`) emit:

- `set` and `set:value`: `{ property: 'value', value, previous }`

[#1]: https://github.com/AlexandriteSoftware/asljs
