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

### Watch nested paths (JavaScript)

```js
import { observable } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' }, active: false });

state.watch(
  [ 'user.name', 'active' ],
  (userName, active) =>
    console.log('User:', userName, 'Active:', active));

state.user.name = 'Bob';
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
import { ObservableObject } from 'asljs-observable';

class User
  extends ObservableObject<{ name: string }>
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
- `options.shallow` (optional): Nested conversion mode.
  - `false` (default): recursively converts nested objects and arrays.
  - `true`: converts only the top-level value.

Returns the original value wrapped with Eventful API and change notifications.
When the target object does not already have a `watch` method, observable adds a
non-enumerable `watch(properties, callback)` method to the wrapped object.

### `observable.watch(target, properties, callback)`

Watches one or more properties/paths and invokes callback with current values.

- `properties` can be a single path string (e.g. `'user.name'`) or an array
  of path strings.

- Runs the callback immediately with current values.
- Re-runs callback each time one of the selected `set:<propertyOrPath>` events
  fires.
- Nested paths are supported, e.g. `'user.name'`.
- `target` may be a plain object; callback still runs immediately with a
  snapshot.
- Updates are observed only where an eventful segment exists along the watched
  path.
- Arrays are not supported by `watch` yet and will throw `TypeError`.
- Returns an unsubscribe function. Calling it removes all listeners attached by
  this `watch` call.

### Events and payloads

More concrete events are emitted first, followed by more generic ones.
E.g., setting `obj.a` emits `set:a` first, then `set`.

| Target kind | Event form | Payload |
| --- | --- | --- |
| object | `set` / `set:<property>` | `{ property, value, previous }` |
| object | `delete` / `delete:<property>` | `{ property, previous }` |
| object | `define` / `define:<property>` | `{ property, descriptor, previous }` |
| array index change | `set` / `set:<index>` | `{ index, value, previous }` |
| array index delete | `delete` / `delete:<index>` | `{ index, previous }` |
| array property change | `set` / `set:<property>` | `{ property, value, previous }` |
| array property delete | `delete` / `delete:<property>` | `{ property, previous }` |
| array property define | `define` / `define:<property>` | `{ property, descriptor, previous }` |
| primitive box | `set` / `set:value` | `{ property: 'value', value, previous }` |

Notes:

- Array index changes use numeric `index` payloads.
- Array non-index properties, including `'length'`, use string `property`
  payloads.
- `define` events are emitted only for non-index array properties.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
