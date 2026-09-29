# observable

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

## Overview

Lightweight observable for JS. Emits events on property changes via on/off/emit.
Works with plain objects, arrays, and primitives.

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
- `options.convert` (optional): Hook that takes over conversion for a single
  value. See [Supporting other kinds of values](#supporting-other-kinds-of-values).
- `options.shallow` (optional): Nested conversion mode.
  - `false` (default): recursively converts nested plain objects and arrays.
  - `true`: converts only the top-level value.

Returns the original value wrapped with Eventful API and change notifications.
Passing a value observable treats as opaque throws a `TypeError`: there would
be nothing to observe, and returning a wrapper whose properties all read as
`undefined` would fail silently. Hold the value in a plain object, or take it
over with `convert`.
When the target object does not already have a `watch` method, observable adds a
non-enumerable `watch(properties, callback)` method to the wrapped object.

### What is converted

Observable converts plain objects (`{}` literals and null-prototype objects)
and arrays. Everything else is treated as an opaque value.

- Opaque values are stored as they are. Their identity is preserved and their
  own mutations are not observed.
- Replacing an opaque value emits `set` as usual, so
  `model.created = new Date()` is observed while
  `model.created.setFullYear(2020)` is not.
- `Date`, `Map`, `Set`, `RegExp`, typed arrays, promises, functions, and
  class instances are all opaque. A proxy cannot forward access to their
  internal slots or private fields, so wrapping them would break them.
- Frozen, sealed, and otherwise non-extensible values are opaque as well. The
  Eventful API cannot be attached to them, and a frozen value has no changes
  to report.
- An opaque value passed as the top-level target is boxed into `{ value }`,
  the same way a primitive is.
- Values that already carry the Eventful API are left as they are and keep
  their own wiring.
- A class that needs to emit changes should extend `ObservableObject` instead
  of relying on conversion.

Within a converted object, only writable data properties are visited.
Accessors are left as accessors: their getters are not run during conversion,
and assigning through them still emits `set` as usual. Non-writable members
and array holes are left alone.

### Supporting other kinds of values

Observable does not ship wrappers for `Date`, `Map`, `Set` or anything else it
treats as opaque, and it is not going to guess how you want them observed. The
`convert` hook is the seam for adding your own.

It is called with every object observable reaches, including the ones it would
otherwise leave opaque, and it decides before the built-in rule does.

- Return a wrapper to take over that value.
- Return the value itself to keep it as it is, even where observable would
  normally convert it.
- Return `undefined` to let observable decide.

```js
import { eventful } from 'asljs-eventful';
import { observable } from 'asljs-observable';

// A wrapper for Set. Note the absence of `has`: eventful reserves `on`,
// `off`, `emit`, `emitAsync`, `has`, `removeAllListeners` and `getListeners`,
// and throws if the wrapped object already defines one of them.
const observableSet = source => {
  const wrapper = eventful({
    contains: value => source.has(value),
    get size() { return source.size; },
    add(value) {
      if (source.has(value)) {
        return;
      }

      const previous = source.size;

      source.add(value);

      wrapper.emit('add', { value });
      wrapper.emit('set:size', { property: 'size', value: source.size, previous });
      wrapper.emit('set', { property: 'size', value: source.size, previous });
    }
  });

  return wrapper;
};

const state = observable(
  { tags: new Set([ 'a' ]) },
  { convert: value => value instanceof Set ? observableSet(value) : undefined });

state.tags.on('add', ({ value }) => console.log('added', value));
state.tags.add('b');
```

Points worth knowing:

- Wrappers take part in the identity map, so one target still maps to one
  wrapper however many times it is referenced.
- A wrapper that emits `set:<property>` can be watched along a path, so
  `state.watch('tags.size', ...)` works in the example above.
- Primitives are never passed to the hook: there is nothing to observe.
- Observable does not emit `new` for a wrapper it did not create, and does not
  check that a wrapper carries the Eventful API.
- Paths are typed from the model, and the path type stops at the kinds
  observable considers opaque. Type the model with your wrapper rather than
  with `Set` if you want `watch('tags.size', ...)` checked statically.

### Nested members in TypeScript

Conversion is deep, and the types say so. Every nested plain object and array
carries the Eventful API and its own `watch`, reachable without a cast:

```ts
const state = observable({ user: { name: 'Alice' } });

state.user.on('set:name', ({ value }) => console.log(value));  // value: string
state.user.watch('name', name => console.log(name));
```

The same holds for assignment: a member of an observable holds an observable,
so a replacement is wrapped rather than assigned plain.

```ts
state.user = observable({ name: 'Bob' });
```

JavaScript callers are unaffected. Assigning a plain value still works at
runtime and is converted on the way in, using the options the parent was
created with. An explicitly wrapped value does not inherit those, so pass them
again if the parent was created with `trace`, `convert`, or a custom
`eventful`.

One target maps to one observable for the whole conversion. An object reached
twice, from two properties or through a cycle, resolves to the same wrapper,
so every handle on it sees the same events.

### `observable.watch(target, properties, callback)`

Watches one or more properties/paths and invokes callback with current values.

- `properties` can be a single path string (e.g. `'user.name'`) or an array
  of path strings.

- Runs the callback immediately with current values.
- Re-runs callback each time one of the selected `set:<propertyOrPath>` events
  fires.
- Nested paths are supported, e.g. `'user.name'`.
- Paths are checked at compile time. `watch` accepts only paths that exist on
  the model, misspellings and Eventful methods are rejected, and callback
  values are typed per path and positional for the array form. Descent stops
  at arrays and opaque values, and at five levels deep, which is what keeps a
  self-referential model from expanding forever.
- `target` may be a plain object; callback still runs immediately with a
  snapshot.
- Updates are observed only where an eventful segment exists along the watched
  path.
- Arrays are not supported by `watch` yet. They carry no `watch` in their type,
  and the injected method throws `TypeError` when called from JavaScript.
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
- Shortening an array reports every element it drops. Each dropped element
  emits `delete:<index>` and `delete` with `{ index, previous }`, furthest
  index first, and the `set:length` pair follows. Holes report nothing, and
  `pop`, `shift` and `splice` remove the tail themselves before assigning
  `length`, so nothing is reported twice. Growing an array emits only the
  `set:length` pair.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
