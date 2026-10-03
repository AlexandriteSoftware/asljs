# performance

## Purpose

The converter trades speed for convenience. `observable(value)` makes existing
data report its changes with one call, which suits prototypes, UI state, and
small to medium models. It is not a substitute for a data structure designed
for its task, and it does not try to be fast.

This page states what the converter costs and how to build the part of a model
that has to perform. No figures are given, because none are measured: the cost
is accepted by design, not a target to tune.

## What the converter costs

- Every read and write of a converted object or array goes through a `Proxy`.
- On an array, every string-keyed read also pays a `Map` lookup, indices and
  `length` included, because the `get` trap has to recognise the nine methods
  it wraps. A symbol key, `Symbol.iterator` included, skips the lookup.
- A reported write reads the property before and after it, to report `previous`
  and `value`.
- Every reported change allocates an entry, and outside a
  [`batch(fn)`][BAT] every write is its own notification.
- Conversion is eager and deep. `observable(value)` visits the whole graph it
  is given, unless `shallow: true` is passed.

A loop over a converted array pays all of this per element:

```js
import { observable } from 'asljs-observable';

const list = observable([ 1, 2, 3 ]);

let total = 0;

// Two trap calls per iteration: one for `length`, one for the index.
for (let i = 0; i < list.length; i++) {
  total += list[i];
}

console.log(total);

// Output:
// 6
```

## Usage

Keep the converter for the parts of a model where convenience matters, and
write the hot parts by hand. The contract is small, so a hand-written
participant is short, and the converter passes one through unchanged.

### Write a class with `ObservableObject`

A class that extends [`ObservableObject`][OOB] keeps
its state in its own fields. Nothing is proxied, and a change is reported only
where the class calls `setAndEmit`, `emitSet` or `emitChange`.

### Write a collection that reports splices

A collection keeps its storage private and reports one `splice` entry per
structural edit, rather than a `set` entry per index. A `splice` counts as a
change to every index from `index` onwards and to `length`, so a query on
`length` follows it without the collection reporting `length` itself. The
[contract][CTR] lists what a producer must emit.

```js
import { ObservableObject, observable, observe } from 'asljs-observable';

class NumberList extends ObservableObject {
  #items = [];

  get length() {
    return this.#items.length;
  }

  at(index) {
    return this.#items[index];
  }

  sum() {
    let total = 0;

    for (const item of this.#items) {
      total += item;
    }

    return total;
  }

  push(...values) {
    const index = this.#items.length;

    this.#items.push(...values);

    this.emitChange([
      { kind: 'splice', index, removed: [], added: values }
    ]);
  }
}

const numbers = new NumberList();

// A conforming object is passed through, so it can sit inside a converted
// model and be reached along a path.
const state = observable({ title: 'Readings', numbers });

console.log('passed through:', state.numbers === numbers);

observe(state).at('numbers.length').subscribe(length =>
  console.log('length', length));

state.numbers.push(1, 2, 3);

console.log('sum', state.numbers.sum());

// Output:
// passed through: true
// length 0
// length 3
// sum 6
```

The loop in `sum` runs over a plain array, so it pays nothing for being
observable. The [`convert` hook][HOK] is the way to
supply such a wrapper for a value the converter would otherwise convert or
refuse.

### Group writes

Inside `batch(fn)` repeated writes coalesce and each emitter delivers once. On
an array, one call that adds many elements is one `splice` entry, while a loop
of single-element calls is one entry each:

```js
import { observable } from 'asljs-observable';

const list = observable([]);

list.on('change', changes =>
  console.log('notification, entries:', changes.length));

list.push(1, 2, 3);

// Output:
// notification, entries: 1
```

### Read outside the proxy

Read a converted array into a plain copy with `slice()` before a tight loop,
and keep `length` in a local variable. The copy is a plain array, so the loop
pays the trap once per element for the copy and nothing afterwards:

```js
import { observable } from 'asljs-observable';

const list = observable([ 1, 2, 3 ]);

const items = list.slice();

console.log('plain copy:', typeof items.on);

let total = 0;

for (let i = 0, length = items.length; i < length; i++) {
  total += items[i];
}

console.log(total);

// Output:
// plain copy: undefined
// 6
```

### Convert less

Pass `shallow: true` where nested values are never observed. Only the
top-level value is converted, and nested plain objects and arrays stay plain.

## Constraints

- The `get` trap is not optimised for speed. A cache keyed on the property, or
  hoisting the wrapped methods onto a prototype, would make the converter more
  complex to remove a cost it accepts. The trap changes only for a correctness
  reason.
- A hand-written participant is responsible for its own reports. The converter
  does not check that a passed-through object conforms beyond `on` and `off`,
  and does not report on its behalf.

## Edge cases

- A conforming object nested in a converted model is not wrapped, so it costs
  what its own implementation costs.
- A plain value assigned to a member of a converted object is converted on the
  way in, so assigning a large plain structure pays for converting all of it.
- A `slice()` copy is a snapshot. It does not follow later changes, and its
  elements are still the converted values, so a write to a nested object
  through the copy is reported.

## See also

- [The converter][CNV] — what `observable()` converts and reports.
- [The contract][CTR] — what a hand-written participant must emit.
- [Batching and delivery][BAT] — what groups writes into one
  notification.

[BAT]: batching.md
[CNV]: converter.md
[CTR]: contract.md
[HOK]: converter.md#the-convert-hook
[OOB]: converter.md#observableobject
