# observable

> Part of [Alexantrite Software Library][#1] - a set of high-quality and
performant JavaScript libraries for everyday use.

Lightweight observable for JS. Emits events on property changes via on/off/emit.
Works with objects, arrays, and primitives.

## Usage

```bash
npm install asljs-observable
```

```js
import { observable } from 'asljs-observable';

const obj = observable({ a: 1, b: 2 });
obj.on('change', (changes) => {
  console.log('Changes:', changes);
});
obj.a = 3; // Triggers change event
obj.b = 4; // Triggers change event
```

## API

### `observable(value, [options])`

Wraps an object, array, or primitive to make it observable.

- `value`: The target object, array, or primitive to be made observable.
- `options`: Optional settings:
  - `eventful`: Custom eventful implementation (default: built-in).
  - `trace`: Function for tracing operations (default: no-op).
  - `attributes`: Property attributes for eventful methods (default: non-enumerable, non-writable, non-configurable).

Returns the observable proxy of the original object.

[#1]: https://github.com/AlexandriteSoftware/asljs
