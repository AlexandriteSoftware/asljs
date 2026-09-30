# The converter

## Purpose

`observable(value, [options])` makes plain JavaScript data satisfy the
[contract](contract.md) without the author writing any subscription code. It is
a helper for the common case of a JSON-shaped model, not the reason the package
exists.

What it produces emits `change` like any other participant; it has no private
event vocabulary of its own.

## Usage

```js
import { observable } from 'asljs-observable';

const model = observable({ a: 1, b: 2 });

model.on('change', changes => {
  for (const change of changes) {
    console.log(`${change.property}: ${change.previous} -> ${change.value}`);
  }
});

model.a = 3;

delete model.b;

// Output:
// a: 1 -> 3
// b: 2 -> undefined
```

A primitive is boxed into `{ value }`. Unlike `eventful`, which refuses a
primitive, observable accepts one:

```js
import { observable } from 'asljs-observable';

const box = observable(10);

box.on('change', ([ change ]) =>
  console.log(`${change.previous} -> ${change.value}`));

box.value = 11;

box.value = 11;

// Output:
// 10 -> 11
```

## Options

- `eventful`: custom `eventful` factory, defaulting to `asljs-eventful`. This is
  also the seam for every `eventful` option; see
  [Eventful's own options](#eventfuls-own-options).
- `trace`: hook `(object, action, payload)`, invoked on `'new'` with
  `{ object }` and on `'change'` with the entry list of one delivery. There is
  also a process-wide `observable.options.trace`, used when a call supplies
  none.
- `convert`: hook that takes over conversion for a single value. See
  [The convert hook](#the-convert-hook).
- `shallow`: `false` by default, which converts nested plain objects and arrays
  recursively. `true` converts only the top-level value, which produces partial
  observation on purpose.

## What is converted

The rule is explicit and narrow:

- Plain object (`{}` literal or null-prototype) or array: convert, and recurse
  into its members.
- `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`,
  function: leaf, stored as it is. Ordinary JSON data and models with methods
  depend on this.
- Already conforms to the contract, meaning `on` **and** `off`: left as it is.
  This is how a hand-written or `EventEmitter`-based object is stitched into a
  converted model. Testing for `on` alone would admit a value that then fails at
  teardown.
- Anything else, `Date` included: throws, naming the path at which the
  unsupported value was found.

```js
import { observable } from 'asljs-observable';

try {
  observable({ orders: [ { meta: new Map() } ] });
} catch (error) {
  console.log(error.message.split('. ')[0] + '.');
}

// Output:
// at value.orders[0].meta: Map is not supported.
```

The path matters: `observable(model)` failing with "unsupported value" on a
large model is not debuggable.

A frozen, sealed, or otherwise non-extensible object is refused for the same
reason a `Map` is: the Eventful API cannot be attached to it, and freezing is
shallow, so storing it would leave exactly the half-observable model this rule
exists to prevent.

Passing something unconvertible as the top-level target throws in the shape
`eventful` uses for a target it cannot augment:

```
Expect an extensible object or array, but the object is frozen.
Expect a plain object, an array, or a primitive, but the value is opaque.
```

### Why `Date` is not a leaf

It is the obvious candidate for one, and it is refused.

Freezing does not help, which is worth recording because it is the first thing
anyone reaches for. A `Date` keeps its time in the `[[DateValue]]` internal slot
and has **no own properties at all**, so `Object.freeze` freezes an empty
property set and every mutator keeps working. Sealing behaves the same, strict
mode makes no difference, and the mutators live on `Date.prototype` where no
per-instance trap reaches them. There is no immutable `Date` in JavaScript, so a
check on `Object.isFrozen` would admit every mutable date while reading like a
guarantee.

Which leaves admitting `Date` as a mutable leaf or refusing it. Three reasons to
refuse:

- Every other leaf is immutable, except functions, which nobody expects to
  observe. `Date` would be the only leaf that is both mutable and value-like,
  and mutating a date is something people actually do.
- It is not JSON. `JSON.parse` never produces a `Date`; a JSON-shaped model
  already carries an ISO string.
- Value semantics come free from refusing it. `model.created = new Date(t)`
  would emit every time, because each `new Date` is a distinct object and
  `Object.is` compares identity. An ISO string or an epoch number reassigned to
  the same instant emits nothing, so the deduplication that works everywhere
  else in the model starts working for dates too.

The cost is friction for models that genuinely hold `Date` objects, and the
`convert` hook is the answer — the same answer the package gives for `Map` and
`Set`. `Date` is not being singled out for refusal; it is being left out of a
special case it did not earn.

### What conversion does not touch

Only writable data properties are visited. Accessors are left as accessors,
because reading one to convert it would run the getter and writing the result
back would replace the accessor with a plain value; assigning through an
accessor still reports a change. Non-writable members and array holes have no
descriptor to rewrite, so they are skipped, and the values they hold are not
converted.

## What the converter reports

- An assignment reports one `set` entry. `[[Set]]` performs
  `[[DefineOwnProperty]]`, so a plain assignment trips two traps; the second is
  suppressed rather than reported twice.
- `delete model.a` reports `{ kind: 'set', property: 'a', value: undefined }`.
- Symbol-keyed properties are stored and not reported: the contract's `property`
  is a string.
- `Object.defineProperty` is reported by whether the observed value changed:
  - as a `set` when it changes, which covers a new value, converting an accessor
    back to a data property, and installing a getter;
  - as nothing when it does not, which covers flipping `writable`, `enumerable`
    or `configurable` on their own, installing a setter with no getter, and
    redefining with the same value.

Descriptor observation is therefore outside the contract, with two consequences
to accept: flipping `enumerable` changes what `JSON.stringify` produces and
notifies nobody, and installing a getter runs it, because reporting the value
means reading the property.

This is reversible. The unrecognised-kind rule means a `define` entry kind can
be added later without breaking any consumer, which is the main reason to take
the narrower contract now.

### Arrays

```js
import { observable } from 'asljs-observable';

const items = observable([ 'a', 'b', 'c' ]);

items.on('change', changes => {
  for (const change of changes) {
    console.log(
      change.kind === 'splice'
        ? `splice at ${change.index}: `
          + `-${change.removed.length} +${change.added.length}`
        : `set ${change.property} = ${change.value}`);
  }
});

items.shift();

items[0] = 'z';

items.length = 0;

// Output:
// splice at 0: -1 +0
// set 0 = z
// splice at 0: -2 +0
```

Five methods report one `splice` entry each, because for those the arguments are
the description:

```
push(x)                 { index: len,   removed: [],      added: [x] }
pop()                   { index: len-1, removed: [last],  added: [] }
shift()                 { index: 0,     removed: [first], added: [] }
unshift(x)              { index: 0,     removed: [],      added: [x] }
splice(i, d, ...items)  the arguments, normalised
```

Four details decide whether that is correct:

- **The call goes through the proxy, not the raw target.** Calling on the raw
  target would skip conversion, so pushed values would not be converted and
  would not join the identity map. Calling through the proxy means the `set`
  trap fires N times inside the batch, so those index entries are suppressed
  while the splice is collected — that is what the "never both" rule costs in
  practice.
- **Splice arguments are normalised, not passed through.** A negative `i`, an
  `i` past the end, an omitted or over-long `d` all resolve first, so the entry
  carries the resolved start and the slice actually removed. `pop()` and
  `shift()` on an empty array report nothing rather than an entry at index `-1`.
- **`added` holds what a read returns**, meaning the converted values.
- **`arr.length = 0` reports a splice too.** It is the common clear idiom and a
  raw assignment, so it would otherwise stay N `set` entries — the fan-out the
  list exists to remove, for the operation most likely to be large.

`sort`, `reverse`, `fill` and `copyWithin` report `set` entries, batched into
one notification. They are permutations and range overwrites: the producer does
not *have* a splice for them, it would have to compute one, and the rule that a
producer emits the most specific description it has then applies unchanged.
Reporting a permutation as a whole-range splice would cost two copies per sort
and actively misinform, since `removed` means removed, so a consumer that
releases resources for removed elements would tear down and rebuild everything
for a reorder. A dedicated `permute` kind would be exact, but it needs a
before-snapshot, O(n) matching, is ambiguous when the array holds duplicates,
and serves a consumer this package does not yet have.

Other array behaviour worth knowing:

- A method invoked so that it bypasses the wrapper, such as
  `Array.prototype.push.call(model, x)`, reports `set` entries. So does an own
  override of a mutating method, which the wrapper steps aside for. Both are
  consistent with the contract, since `splice` is optional.
- A raw index assignment reports a `set`, because there is no splice to
  describe. So `arr.shift()` and `arr[0] = x` report different entry kinds for
  arguably similar edits; that is inherent to what is observable through a
  proxy.
- Growing an array by writing past the end reports the index `set` and no
  `length` change. The array exotic object updates `length` itself, so by the
  time the trap sees the write the value is already current. Assigning `length`
  directly to grow the array does report it.

## Identity

One target maps to one observable, and that holds for the lifetime of the
process rather than for one call. An object reached twice, from two properties,
through a cycle, or from two separate `observable(...)` calls, resolves to the
same wrapper, so every handle on it sees the same events:

```js
import { observable } from 'asljs-observable';

const shared = { n: 1 };

const left = observable({ shared });
const right = observable({ shared });

console.log('one wrapper:', left.shared === right.shared);

right.shared.n = 7;

console.log('seen through the other handle:', left.shared.n);

// Output:
// one wrapper: true
// seen through the other handle: 7
```

That is not a convenience: conversion grafts the Eventful API onto the target
itself, so an object can only belong to one observable. Wrapping an already
converted target again returns what it already has, which means the options of
the later call have nothing to apply to. Pass one options object to every call
for a model if you want the same `trace`, `convert` or `eventful` applied
throughout.

The wrapper is registered before its members are converted, which is what makes
a cyclic model converge.

## Nested members in TypeScript

Conversion is deep, and the types say so. Every nested plain object and array
carries the Eventful API, reachable without a cast. The same holds for
assignment: a member of a converted object holds a converted value, so a
replacement is wrapped rather than assigned plain.

```ts
import { observable } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' } });

state.user.on('change', changes => console.log(changes.length));

state.user = observable({ name: 'Bob' });
```

A plain object is rejected there:

```ts
import { observable } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' } });

// error TS2322
state.user = { name: 'Bob' };
```

JavaScript callers are unaffected. Assigning a plain value still works at
runtime and is converted on the way in, using the options the parent was created
with. An explicitly wrapped value does not inherit those, so pass them again if
the parent was created with `trace`, `convert`, or a custom `eventful`.

`Converted<T>` is the type of what `observable()` returns, with
`ConvertedObject<T>`, `ConvertedArray<T>`, `ConvertedPrimitive<T>`,
`ConvertedMember<T>` and `ConvertedMembers<T>` behind it. A value the converter
refuses types as `never`, because converting it throws and there is no result to
describe. Depth is capped at five levels, which keeps a self-referential model
finite.

## The convert hook

Observable does not ship wrappers for `Date`, `Map`, `Set` or anything else it
refuses, and it must not start: it cannot guess how you want them observed. The
`convert` hook is the seam, and with throw-by-default it is the only escape from
an unsupported value.

It is called with every object observable reaches, including the ones it would
otherwise refuse, and it decides before the built-in rule does.

- Return a wrapper to take over that value.
- Return the value itself to keep it as it is, even where observable would
  convert or refuse it.
- Return `undefined` to let observable decide.

```js
import { eventful } from 'asljs-eventful';
import { observable, observe } from 'asljs-observable';

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

      wrapper.emit('change', [
        { kind: 'set', property: 'size', value: source.size, previous }
      ]);
    }
  });

  return wrapper;
};

const state = observable(
  { tags: new Set([ 'a' ]) },
  {
    convert: value =>
      value instanceof Set ? observableSet(value) : undefined
  });

observe(state).at('tags.size').subscribe(size => console.log('tags', size));

state.tags.add('b');

// Output:
// tags 1
// tags 2
```

Points worth knowing:

- Wrappers take part in the identity map, so one target still maps to one
  wrapper however many times it is referenced.
- A wrapper that conforms can be queried along a path, as above.
- Primitives are never passed to the hook: there is nothing to observe.
- Observable does not emit `new` for a wrapper it did not create, and does not
  check that a wrapper conforms.
- The path and member types stop at the kinds observable refuses, and a refused
  member's type is `never`. Type the model with your wrapper rather than with
  `Set` if you want `at('tags.size')` checked statically.

## `ObservableObject`

A base class for a hand-written participant. It emits `change` like every other
producer here, and its emissions join an open [`batch(fn)`](batching.md),
because it reports through the same path the converter does.

- `setAndEmit(property, previous, value, assign)` assigns and reports, unless
  `Object.is(previous, value)`.
- `emitSet(property, previous, value)` reports one property change.
- `emitChange(changes)` reports a list of changes as one notification.

```ts
import { ObservableObject, observe } from 'asljs-observable';

class User extends ObservableObject<{ name: string }>
{
  #name: string;

  constructor(name: string) {
    super();

    this.#name = name;
  }

  get name(): string {
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

const user = new User('Alice');

observe(user).at('name').subscribe(name => console.log(name));
```

Query an instance with `observe(instance)`; the class carries no query of its
own.

## Eventful's own options

`strict`, the `error` hook, and eventful's own `trace` get no options of their
own here. `ObservableOptions.eventful` takes the factory itself, so a closure
supplies whatever eventful options it likes. This applies to the top-level
target, to nested conversions, and to the primitive box.

```js
import { eventful } from 'asljs-eventful';
import { observable } from 'asljs-observable';

const model = observable(
  { a: 1 },
  { eventful: value => eventful(value, { strict: true }) });

model.on('change', () => {
  throw new Error('from a listener');
});

try {
  model.a = 2;
} catch (error) {
  console.log('propagated:', error.message);
}

// Output:
// propagated: from a listener
```

One seam covers every present and future eventful option, so mirrored options
here would be duplication that has to be maintained in step with the other
package.

- `strict` makes a listener that throws propagate out of an ordinary assignment.
  That is useful while debugging a model and surprising in one that is not.
- Observable's `trace` option and eventful's `trace` are different hooks and
  both can be active. Observable's is `(object, action, payload)` over `new` and
  `change`; eventful's is `(action, payload)` over `new`, `on`, `off`, `emit`
  and `emitAsync`. They report different things and neither replaces the other.

## See also

- [The contract](contract.md) — what the converter's output satisfies.
- [Batching and delivery](batching.md) — when a notification arrives.
- [The query](query.md) — reading values out of a converted model.
