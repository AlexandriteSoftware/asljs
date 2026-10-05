# data-binding-get-method-hijacks-reads

A model with a `get` method has every binding read through `model.get(path)`, an
undocumented protocol that bypasses the observable contract.

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

    return () => { };
  }

  // The path comes from markup, so it cannot be checked against the model type.
  const unsubscribe =
    observe(model)
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

`libs/data-binding/src/read-model-path.ts`:

```ts
  if (hasGetMethod(model)) {
    return model.get(path);
  }

  return readNestedPath(
    model,
    path);
}

function hasGetMethod(
    value: DataModel
  ): value is DataModel & { get: (path: string) => unknown; }
{
  return typeof (value as { get?: unknown; }).get === 'function';
}
```

The check is on the model passed to that binding, so inside `data-bind-context`
it applies to the context object, not the root.

## Problem

`readModelPath` checks `typeof model.get === 'function'` and, if so, returns
`model.get(path)` instead of walking the path. Nothing in `docs/Bindings.md`,
`AGENTS.md` or the types mentions this; the only trace is one test, "uses
get(path) when provided". A model that happens to carry a `get` action, a record
store with `get(id)`, a `Map`-like wrapper, or a class with a `get` method, is
silently rerouted:

```ts
const model = observable({ name: 'Alice', get(id) { return 'record-' + id; } });

bindDataModel(root, model);
// <span data-bind-text="name"></span> renders 'record-name'

model.name = 'Bob';
// still 'record-name'
```

The subscription side does not know the protocol: `watchModelPath` subscribes
with `observe(model).at('name')`, which reads the property. So the binding
re-renders when `name` changes and then reads something else, and a change in
whatever `get` consults is never observed. The two halves of a binding use
different path semantics.

The reason the halves can disagree is that `watchModelPath` discards the value
`subscribe` delivers and the binding calls `readModelPath` again. For a
conforming model the query already resolved the path, deduplicated it, and
handed it over; the second read is a second resolution with its own rules.

Proposed behaviour: remove the `get` protocol, or make it explicit in
`BindDataModelOptions` (for example a `read(model, path)` hook) and document it.
Independently, let `watchModelPath` pass the delivered value to its callback and
have `bindValueModel` and `bindEventModel` use it, keeping `readModelPath` only
for the plain-model branch, so a value is resolved once per change by one
reader. Replace the `get(path)` test accordingly.

## Where

- `libs/data-binding/src/read-model-path.ts` - `hasGetMethod` and the `get`
  branch.
- `libs/data-binding/src/read-model-path.test.ts` - "uses get(path) when
  provided", the only specification of the protocol.
- `libs/data-binding/src/watch-model-path.ts` - the callback that drops the
  delivered value.
- `libs/data-binding/src/bind-value-model.ts`,
  `libs/data-binding/src/bind-event-model.ts` - the re-read in `update` and
  `refreshAction`.
- `libs/data-binding/src/bind-data-model.ts` - the same re-read in
  `bindContextElement`'s `bindChildren`.
