# data-binding-value-resolved-twice

Every binding on an observable model resolves its path twice per change: the
subscription delivers the value, and the binding drops it and reads the model
again.

Package: `data-binding`.

## Context

Every binding resolves its path in two steps: `watchModelPath` decides when to
read, and `readModelPath` does the reading. `bindValueModel` (`data-bind-text`,
`-html`, `-class-*`, `-prop-*`, attributes) passes `update` as the callback,
`bindEventModel` passes `refreshAction`, and `bindContextElement` in
`bind-data-model.ts` passes `bindChildren`; each calls `readModelPath` itself.

`libs/data-binding/src/watch-model-path.ts`:

```ts
  if (!isObservable(model)) {
    callback();

    return createDisposer(
      () => { });
  }

  // The path comes from markup, so it cannot be checked against the model type.
  // The subscription's disposer already runs once and reports whether it did.
  return observe(model)
    .at(
      path as never)
    .subscribe(
      () => callback());
```

`subscribe` calls back with the current value at the path, now and on every
change; `observe` deduplicates with `Object.is`. The `() => callback()` wrapper
drops that value.

`libs/data-binding/src/bind-value-model.ts`:

```ts
const update =
  (): void =>
  {
  const rawValue =
    readModelPath(
      model,
      spec.path);
```

## Problem

For a conforming model the query has already resolved the path, deduplicated it
and handed the value over; the second read is a second resolution by a different
reader. The two readers have disagreed before: `readModelPath` once routed reads
through a model's `get(path)` method, which the subscription side never knew
about. That protocol is gone, both now read properties, and both reject an empty
segment, but a missing path is still `null` for `readModelPath` and `undefined`
for the query.

As long as the binding re-reads, the value it renders is not the value the
subscription reported, and a change in either reader can make the two halves of
a binding drift apart again.

Proposed behaviour: let `watchModelPath` pass the delivered value to its
callback, and have `bindValueModel`, `bindEventModel` and `bindChildren` use it,
keeping `readModelPath` only for the plain-model branch, so a value is resolved
once per change by one reader. Decide in the same change which nullish value a
missing path renders as, since the two readers disagree.

## Where

- `libs/data-binding/src/watch-model-path.ts` - the callback that drops the
  delivered value.
- `libs/data-binding/src/bind-value-model.ts`,
  `libs/data-binding/src/bind-event-model.ts` - the re-read in `update` and
  `refreshAction`.
- `libs/data-binding/src/bind-data-model.ts` - the same re-read in
  `bindContextElement`'s `bindChildren`.
- `libs/data-binding/src/read-model-path.ts` - the plain-model reader.
