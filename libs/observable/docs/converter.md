# The converter

## Purpose

`observable(value, [options])` creates an observable version of plain
JavaScript data: a new object, array or box that satisfies the
[contract](contract.md) and reports its own changes. It is a helper for the
common case of a JSON-shaped model, not the reason the package exists.

It copies rather than extends. The data it is given is left untouched, and what
it returns emits `change` like any other participant, with no private event
vocabulary of its own. The rules are stated one by one in
[the design](Design.md); this page explains them with examples.

## Usage

```js
import { observable } from 'asljs-observable';

const original = { a: 1, b: 2 };
const model = observable(original);

model.on('change', changes => {
  for (const change of changes) {
    console.log(`${change.property}: ${change.previous} -> ${change.value}`);
  }
});

model.a = 3;

delete model.b;

console.log('original:', JSON.stringify(original));

// Output:
// a: 1 -> 3
// b: 2 -> undefined
// original: {"a":1,"b":2}
```

A primitive is boxed into `{ value }`, and so are a `Date`, a `RegExp` and a
function:

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

- `deep`: `false` by default, which converts only the top-level value and keeps
  nested objects and arrays by reference. `true` converts nested plain objects
  and arrays too, all the way down.
- `convert`: a hook that replaces one object with another. See
  [The convert hook](#the-convert-hook).
- `eventful`: the factory that adds the methods, `eventful` from
  `asljs-eventful` by default. See
  [The eventful factory](#the-eventful-factory).
- `trace`: a hook `(object, action, payload)`, invoked on `'new'` with
  `{ object }` for every observable the call creates, and on `'change'` with the
  entry list of one delivery. There is also a process-wide
  `observable.options.trace`, used when a call supplies none.

## What is converted

The value given to `observable` is checked against these rules in order, and the
first that matches applies:

1. A primitive, a `Date`, a `RegExp` or a function is boxed as `{ value }`.
2. When `convert` returns something other than `null` or `undefined`, that is
   returned. It must be a new observable, not the value itself.
3. An object that already has `on` and `off`, such as an `EventEmitter` or
   another observable, throws: returning it would make the observable version
   the original itself.
4. An object or array that owns a property named like a method the factory adds
   throws. With the default factory those are `on`, `once`, `off`, `emit`,
   `emitAsync`, `has`, `removeAllListeners` and `getListeners`. With a custom
   factory only `on` and `off` are known; any other name it adds is its own
   responsibility.
5. A plain object or plain array holding plain data is copied into a new
   observable. A frozen one throws: it cannot change, so there is nothing to
   observe.
6. Anything else throws.

Each value inside a copied object or array is checked against the nested rules,
in order:

1. A primitive is copied.
2. A `Date`, a `RegExp`, a function, or a frozen plain object or array is kept
   by reference. These are values: never converted and never traversed.
3. Without `deep: true`, any other object or array is kept by reference.
4. When `convert` returns something other than `null` or `undefined`, that is
   used.
5. An object that already has `on` and `off` is kept by reference.
6. An object or array that owns a reserved name throws, as at the top level.
7. A plain object or plain array holding plain data is converted, applying these
   rules to its own values.
8. Anything else throws.

```js
import { observable } from 'asljs-observable';

const when = new Date(0);
const user = { name: 'Ada' };
const model = observable({ when, user, tags: [ 'a' ] }, { deep: true });

console.log('date kept:', model.when === when);
console.log('user copied:', model.user !== user);
console.log('original untouched:', 'on' in user);

// Output:
// date kept: true
// user copied: true
// original untouched: false
```

### Plain data

An object is plain when its prototype is `null` or an `Object.prototype`, and
an array is plain when its prototype is an `Array.prototype`. Both checks
recognise any realm's prototypes, so a literal parsed in an iframe or a `vm`
context is plain data too, and a `Date` or `RegExp` from another realm is still
a value. A class instance, an instance of an `Array` subclass, a `Map`, a `Set`
and every other object are not plain: they throw unless `convert` takes them
over, or, nested without `deep: true`, they are kept by reference.

A plain object or array is converted only when it holds plain data. Every own
property, other than an array's `length`, must have a string key and be an
ordinary data property that is enumerable, writable and configurable. The
container must be extensible, and an array must have no holes and no own
properties other than its indices. Accessors, symbol keys, read-only or hidden
properties, sealed objects and sparse arrays all throw.

The case `observable` is for is plain data such as `observable({ user })`.
Data that needs accessors, hidden properties or symbol keys is a class in all
but name, and a class reports its own changes through `eventful` or
[`ObservableObject`](#observableobject) without `observable`.

### Errors name the path

Every refusal starts with the path of the offending value, written from `value`,
then the reason:

```js
import { observable } from 'asljs-observable';

try {
  observable({ orders: [ { meta: new Map() } ] }, { deep: true });
} catch (error) {
  console.log(error.message.split('. ')[0] + '.');
}

// Output:
// at value.orders[0].meta: Map is not supported.
```

`observable(model)` failing with "unsupported value" on a large model is not
debuggable; naming the path is. An error thrown by the `convert` hook or the
factory is prefixed the same way, with the original error as its `cause`.

### Cycles and repeated objects

Under `deep: true` an object reached again while its own values are still being
converted is a circular reference, and it throws, naming both ends. An object
reached again after its conversion has finished is a repeated reference: it
becomes one observable, used in both places, so the result keeps the shape of
the data.

```js
import { observable } from 'asljs-observable';

const shared = { n: 1 };
const model = observable({ a: shared, b: shared }, { deep: true });

console.log('one observable:', model.a === model.b);

const cyclic = {};
cyclic.self = cyclic;

try {
  observable(cyclic, { deep: true });
} catch (error) {
  console.log(error.message);
}

// Output:
// one observable: true
// at value.self: circular reference to value
```

This holds within one call. Separate calls produce separate observables, because
each one copies the data it is given.

### Why dates are values

A `Date` keeps its time in an internal slot and has no own properties, so a copy
by its properties is empty, and a proxy cannot report what its mutators do.
Rather than refuse it, `observable` treats it as a value, like a string: kept by
reference, compared by identity, never converted. The same goes for a `RegExp`,
a function, and a frozen plain object or array, which cannot change at all.

The consequence to accept: changing a date in place, `model.when.setTime(0)`,
changes it for every holder and reports nothing. Replace it instead,
`model.when = new Date(0)`, and the replacement is reported.

A frozen object with internal state, such as a frozen `Map`, is not a value:
freezing does not stop its internal state changing.

## After conversion

Conversion happens once, in the `observable` call. A value written to an
observable later is stored as it is: not converted, not copied, not checked. The
write itself is reported.

```js
import { observable } from 'asljs-observable';

const model = observable({ user: { name: 'Ann' } }, { deep: true });

model.user.on('change', () => console.log('user changed'));

model.on('change', changes =>
  console.log('model changed:', changes[0].property));

model.user = { name: 'Bob' };
model.user.name = 'Carol';

model.user = observable({ name: 'Dan' });
model.user.on('change', () => console.log('new user changed'));
model.user.name = 'Eve';

// Output:
// model changed: user
// model changed: user
// new user changed
```

Keeping the data observable after that is the caller's job: convert a value
before assigning it if its own changes should be reported. A written value is
stored by reference, so it is shared with whoever assigned it.

## What the converter reports

- An assignment reports one `set` entry. `[[Set]]` performs
  `[[DefineOwnProperty]]`, so a plain assignment trips two traps; the second is
  suppressed rather than reported twice.
- `delete model.a` reports `{ kind: 'set', property: 'a', value: undefined }`.
- A write that leaves the value as it was, compared with `Object.is`, reports
  nothing.
- Symbol-keyed properties are stored and not reported: the contract's `property`
  is a string, and symbol keys are not data.
- `Object.defineProperty` is reported by whether the observed value changed:
  - as a `set` when it changes, which covers a new value, converting an accessor
    back to a data property, and installing a getter;
  - as nothing when it does not, which covers flipping `writable`, `enumerable`
    or `configurable` on their own, installing a setter with no getter, and
    redefining with the same value.

Reporting a value always means reading it, so installing a getter runs it, and
an accessor's getter runs twice per reported change: once before the write for
`previous` and once after it for `value`.

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

An observable array is an array: `Array.isArray` is `true`, it can be iterated
and spread, `JSON.stringify` writes it as an array, and methods that return a
new array, such as `map` and `slice`, return a plain one.

Five methods report one `splice` entry each, because for those the arguments are
the description:

```
push(x)                 { index: len,   removed: [],      added: [x] }
pop()                   { index: len-1, removed: [last],  added: [] }
shift()                 { index: 0,     removed: [first], added: [] }
unshift(x)              { index: 0,     removed: [],      added: [x] }
splice(i, d, ...items)  the arguments, normalised
```

A splice at `index` also changes every index from `index` onwards and, when the
counts differ, `length`. No separate `set` is reported for them: a subscriber
interprets the splice, or reads the array again.

- **Splice arguments are normalised, not passed through.** A negative `i`, an
  `i` past the end, an omitted or over-long `d` all resolve first, so the entry
  carries the resolved start and the slice actually removed. `pop()` and
  `shift()` on an empty array report nothing rather than an entry at index `-1`.
- **`added` holds the values as they were written**, not converted.
- **`arr.length = 0` reports a splice too.** It is the common clear idiom and a
  raw assignment, so it would otherwise stay N `set` entries. The splice carries
  the dropped elements, so they are read before the write.

`sort`, `reverse`, `fill` and `copyWithin` report `set` entries, batched into
one notification. They are permutations and range overwrites: the producer does
not have a splice for them, and reporting a permutation as a whole-range splice
would misinform, since `removed` means removed.

Other array behaviour worth knowing:

- A method invoked so that it bypasses the wrapper, such as
  `Array.prototype.push.call(model, x)`, reports `set` entries. So does an own
  override of a mutating method written after creation, which the wrapper steps
  aside for. Both are consistent with the contract, since `splice` is optional.
- Growing an array by writing past the end reports the index `set` and then a
  `set` for `length`, because no splice describes the growth. Assigning
  `length` directly to grow the array reports it too.

## Nested members in TypeScript

The type promises what every call guarantees: the top-level value carries the
methods. Members keep their declared type, with or without `deep`, so both calls
below return the same type:

```ts
import { observable } from 'asljs-observable';

const flat = observable({ user: { name: 'Alice' } });
const deep = observable({ user: { name: 'Alice' } }, { deep: true });

flat.on('change', changes => console.log(changes.length));
deep.on('change', changes => console.log(changes.length));

// error TS2339
deep.user.on('change', changes => console.log(changes.length));
```

`deep: true` converts nested objects at runtime, but a member can still hold
either the plain value or its observable: a value assigned later is whatever it
is. Test a member with `isObservable` to reach its methods:

```ts
import { isObservable, observable } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' } }, { deep: true });

if (isObservable(state.user)) {
  state.user.on('change', changes => console.log(changes.length));
}
```

Or wrap the member yourself, and its type says so:

```ts
import { observable } from 'asljs-observable';

const user = observable({ name: 'Alice' });
const state = observable({ user });

state.user.on('change', changes => console.log(changes.length));
```

`Converted<T>` is the type of what `observable()` returns, with
`ConvertedObject<T>`, `ConvertedArray<T>` and `ConvertedPrimitive<T>` behind
it. A `Date`, a `RegExp` or a function converts to a `ConvertedPrimitive`. A
top-level value the converter refuses, such as a `Map`, types as `never`,
because converting it throws and there is no result to describe.

## The convert hook

Observable does not ship wrappers for `Map`, `Set` or anything else it refuses,
and it must not start: it cannot guess how you want them observed. The `convert`
hook is the seam.

It is asked about the top-level value when that is an object, and, under
`deep: true`, about every nested object that is not kept by reference first. It
is never asked about a primitive, a `Date`, a `RegExp`, a function or a nested
frozen plain object or array. It has the first say on everything it is asked
about, including whether an object already has `on` and `off`.

- Return `null` or `undefined` to leave the decision to the rules.
- Return anything else to use it in place of the object. No other rule applies
  to it, it is not checked and it is not traversed.
- At the top level the result is what `observable` returns, so it must be a new
  observable, with `on` and `off`, and not the given object itself; otherwise
  `observable` throws. A nested result is not checked, and returning the given
  object itself keeps it by reference.

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
    deep: true,
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

- An object reached twice in one call is asked about once, and the result is
  used in both places.
- A circular reference throws before the hook is asked again.
- A wrapper that conforms can be queried along a path, as above.
- Observable does not emit `new` for a wrapper it did not create.
- `observable` recognises plain data from any realm, but a hook that tests with
  `instanceof` sees only its own realm's classes.

### Keeping the types right

The types come from the model's declared type, never from the hook. A member
declared as `Set<string>` is typed `Set<string>` whatever `convert` put there,
and the path types stop at it, so `at('tags.size')` is not offered. When the
replacement is not a `Set`, the type is wrong, and wrong quietly where the two
share a method name: the wrapper above has no set `has`, but it has eventful's
`has`, which checks for listeners, so `model.tags.has('a')` compiles and
returns `false`.

Two habits keep the types true:

- **Substitute before calling `observable()`.** Put the observable replacement
  into the data yourself, so the model's type names it and `convert` is not
  needed for that member. A value that already has `on` and `off` is kept by
  reference, with or without `deep`.
- **When `convert` substitutes, return an object with the original's
  signature.** An observable replacement for a `Map` should implement `Map`, and
  one for a `Set` should be a `Set`, so that the declared type stays true and
  every method it promises behaves as the original's would. Its path is still
  not offered below the member, because the types see a `Set`; subscribe to the
  member itself instead.

```ts
import { asObservable, observable, type Change } from 'asljs-observable';

type Listener = (changes: readonly Change[]) => void;

// A Set that reports its own changes. Every change to a set changes its size,
// so a set entry for size describes them all.
class ObservableSet<T> extends Set<T>
{
  #listeners = new Set<Listener>();

  constructor(values: Iterable<T> = []) {
    super();

    for (const value of values) {
      super.add(value);
    }
  }

  on(_event: 'change', listener: Listener): void {
    this.#listeners.add(listener);
  }

  off(_event: 'change', listener: Listener): void {
    this.#listeners.delete(listener);
  }

  override add(value: T): this {
    const previous = this.size;

    super.add(value);
    this.#report(previous);

    return this;
  }

  override delete(value: T): boolean {
    const previous = this.size;
    const deleted = super.delete(value);

    this.#report(previous);

    return deleted;
  }

  override clear(): void {
    const previous = this.size;

    super.clear();
    this.#report(previous);
  }

  #report(previous: number): void {
    if (previous === this.size) {
      return;
    }

    for (const listener of this.#listeners) {
      listener([
        { kind: 'set', property: 'size', value: this.size, previous }
      ]);
    }
  }
}

// Substituted before the call: the type names the observable set.
const prepared = observable({ tags: new ObservableSet([ 'a' ]) });

prepared.tags.on('change', changes => console.log(changes.length));

// Substituted by convert: the type says Set, and the member is one.
const converted = observable<{ tags: Set<string> }>(
  { tags: new Set([ 'a' ]) },
  {
    deep: true,
    convert: value =>
      value instanceof Set ? new ObservableSet(value) : undefined
  });

converted.tags.has('a');

asObservable(converted.tags)?.on('change', changes =>
  console.log(changes.length));
```

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

## The eventful factory

The `eventful` option takes the factory that adds the methods to every
observable a call creates: the top-level one, every nested one, and the box. It
must add at least `on`, `off` and `emit`; anything more is its choice, and the
names it adds are the reserved ones. The default, `eventful` from
`asljs-eventful`, adds its methods as non-enumerable properties, so
`Object.keys`, spreading and `JSON.stringify` see only the data.

`strict`, the `error` hook, and eventful's own `trace` get no options of their
own here. The factory is also how its settings are passed, so a closure supplies
whatever eventful options it likes:

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
  and `emitAsync`.
- Writing a method the factory added, such as `model.on = null`, is not
  specified: what happens is whatever the factory's methods do.

## See also

- [The design](Design.md) — the rules, one by one.
- [The contract](contract.md) — what the converter's output satisfies.
- [Batching and delivery](batching.md) — when a notification arrives.
- [The query](query.md) — reading values out of a converted model.
- [Performance](performance.md) — what conversion costs, and what to write by
  hand instead.
