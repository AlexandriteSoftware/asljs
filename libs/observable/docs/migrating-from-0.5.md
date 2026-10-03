# Migrating from 0.5

## Purpose

0.6 is one major release with no deprecation path. The package was three things
fused into one entry point — a contract, a query, and a converter — and this
release separates them. Nothing about the event model survives unchanged.

This page lists what breaks and what to replace it with.

## The event model

Every `set`, `set:<property>`, `delete`, `delete:<property>`, `define` and
`define:<property>` listener is replaced by one `change` event carrying a list
of entries.

Before:

```
model.on('set:name', ({ value, previous }) => { ... });
model.on('set', ({ property, value, previous }) => { ... });
model.on('delete', ({ property, previous }) => { ... });
```

After:

```js
import { observable } from 'asljs-observable';

const model = observable({ name: 'Alice' });

model.on('change', changes => {
  for (const change of changes) {
    if (change.kind !== 'set') {
      continue;
    }

    console.log(change.property, change.previous, '->', change.value);
  }
});

model.name = 'Bob';

delete model.name;

// Output:
// name Alice -> Bob
// name Bob -> undefined
```

Consequences to check in your own code:

- **Payloads changed.** An array index change loses its numeric `index` field
  and becomes a string `property`. `define` payloads are gone entirely.
- **Removal is a set to `undefined`.** There is no delete event, so a consumer
  can no longer distinguish a deleted key from one present and undefined, nor an
  array hole from an `undefined` element.
- **Descriptor observation is gone.** Flag-only changes, and installing a setter
  with no getter, are not reported at all. A definition that changes the
  observed value is reported as a `set`.
- **Notification counts changed.** An array method call is one notification
  instead of N, and it usually carries a `splice` entry rather than per-index
  `set` entries.
- **Deleted properties are now watched.** A query of `'user.name'` re-runs when
  `name` is deleted, where `watch` previously did not.

See [the contract](contract.md) for the entry shapes and the rules a consumer
has to apply.

## `watch` is gone

All three entry points are removed: the method injected into every converted
object, `observable.watch`, and `ObservableObject.prototype.watch`. Use
`observe(source)`.

Before:

```
state.watch('user.name', name => { ... });
state.watch([ 'user.name', 'active' ], (name, active) => { ... });
observable.watch(state, 'user.name', name => { ... });
```

After:

```js
import { combine, observable, observe } from 'asljs-observable';

const state = observable(
  { user: { name: 'Alice' }, active: false },
  { deep: true });

observe(state).at('user.name').subscribe(name => console.log('name', name));

combine([
  observe(state).at('user.name'),
  observe(state).at('active')
]).subscribe(([ name, active ]) => console.log('both', name, active));

state.user.name = 'Bob';

// Output:
// name Alice
// both Alice false
// name Bob
// both Bob false
```

Two behaviour changes come with it:

- **A plain root throws.** `observe()` refuses a source that does not conform,
  where `watch` used to call back once with a snapshot and fall silent. The
  message names the fix: wrap it with `observable()`.
- **Arrays are queryable.** `watch` threw for any array target. `observe(array)`
  and `at('items.0.name')` both work.

See [the query](query.md) for the operators and the deduplication rules.

## Conversion is single-level by default

0.5 converted nested plain objects and arrays by default, and took
`shallow: true` to convert only the top-level value. `shallow` is gone:
conversion is single-level by default, and `deep: true` restores the old
default.

Before:

```
observable(model);
observable(model, { shallow: true });
```

After:

```
observable(model, { deep: true });
observable(model);
```

A model whose nested members are observed, queried along a path below the
root, or relied on to be refused when unsupported needs `deep: true`. The
`convert` hook is consulted for nested values only under `deep: true`.

## Models the converter used to accept

Under `deep: true`, an unsupported nested value now throws, with the path in the
message, instead of being stored silently. The two cases most likely to be hit:

- **`Date`.** A nested date was stored as it was; it is refused now. See
  [why](converter.md#why-date-is-not-a-leaf), and use the
  [`convert` hook](converter.md#the-convert-hook) for a model that genuinely
  holds one.
- **Frozen and sealed objects.** Previously stored as they were, refused now.

`Map`, `Set`, `RegExp`, typed arrays and class instances were already unusable
as nested values in the sense that nothing about them was observed; the
difference is that the failure is loud rather than silent.

If you want the old behaviour for a particular kind, return the value itself
from the `convert` hook:

```js
import { observable } from 'asljs-observable';

const model = observable(
  { created: new Date(1) },
  {
    deep: true,
    convert: value => value instanceof Date ? value : undefined
  });

console.log('kept:', model.created.getTime());

// Output:
// kept: 1
```

## Type names

- `Observable` is now the contract interface. The converter's return type is
  `Converted<T>`, with `ConvertedObject<T>`, `ConvertedArray<T>` and
  `ConvertedPrimitive<T>` behind it. It describes the top-level value only:
  members keep their declared type, with or without `deep: true`. Reach a
  converted member through `isObservable`, or wrap it yourself.
- `ObservableOpaque` is `UnsupportedValue`.
- `WatchPath`, `WatchPathValue` and `WatchPathValues` are `ObservablePath`,
  `ObservablePathValue` and `ObservablePathValues`.
- `WatchedValues`, `WatchMethod`, `ObservableWatchFn`, the local
  `EventfulFactory`, and the per-event map types (`ObservableEventsObject`,
  `KeyedSetEvents`, `ArraySetPayload` and the rest) are gone. One
  `ObservableEvents` map replaces them.
- `ObservableTraceFn` reports `'new'` and `'change'`; `'set'`, `'delete'` and
  `'define'` are gone.
- A value the converter refuses types as `never`, because converting it throws.
  Type the model with your wrapper if you rely on the `convert` hook.

## New in 0.6

Not breaking, but worth knowing about while you are here:

- [`batch(fn)`](batching.md) groups changes into one notification per emitter.
- `isObservable` and `asObservable` test conformance.
- `map`, `filter`, `distinct` and `combine` operators.
- `.value` reads a query once without subscribing.
- A source works with RxJS `fromEvent` unchanged; see [RxJS](rxjs.md).

## Still not built

None of these is required for the package to be complete, and none should be
built speculatively:

- Async iteration as a terminal.
- `[Symbol.observable]` on a chain, so `from(chain)` works in RxJS.
- `share()`, if fan-out over an expensive `map` ever justifies it.
- A `change:<property>` fast path a source can advertise — an optimisation, not
  a second contract.
