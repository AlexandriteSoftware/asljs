# data-binding-setup-failure-leaks-subscriptions

When `bindDataModel` throws during setup, the subscriptions it had already
created stay attached to the model with no way to release them.

Package: `data-binding`.

## Context

`bindDataModel(root, model, options)` binds everything in one synchronous pass
and returns a single disposer. The walk:

- `bindSubtree` iterates `root.children`. An element with `data-bind-context`
  goes to `bindContextElement`; any other element goes to
  `bindElementAttributes` and then recursively to `bindSubtree`.
- `bindElementAttributes` turns each `data-bind-*` attribute into a spec and
  calls `bindValueModel` or `bindEventModel`, pushing the returned disposer into
  the caller's array.
- Both leaves subscribe through `watchModelPath`, which, for an observable
  model, calls `observe(model).at(path).subscribe(...)`. `subscribe` delivers
  the current value immediately, so the first `update()` (pipes included) runs
  inside setup.
- `bindContextElement` watches the context path and, on every change, disposes
  the previous children and calls `bindSubtree` again for the new value.

Only a fully completed walk returns the disposer over the collected array.

`libs/data-binding/src/bind-data-model.ts`:

```ts
  const disposers: Array<() => boolean> = [ ];

  for (const child of [ ...root.children ] as HTMLElement[]) {
    // ...
      bindElementAttributes(
        child,
        model,
        options,
        warnOnce,
        nextPrefix,
        disposers);
    // ...
  }

  return createDisposer(
    (): void =>
    {
      for (const dispose of disposers) {
        dispose();
      }
    });
```

Setup errors of value bindings are rethrown; those of event bindings are only
warned about:

```ts
    } catch (error) {
      if (spec.kind === 'value') {
        throw error;
      }

      warnOnce(
        `${prefix}:bind-error`,
        `${prefix}: binding setup failed`,
        error);
    }
```

The context rebind:

```ts
const bindChildren =
  (): void =>
  {
  childDisposer?.();
  // ...
  childDisposer =
    bindSubtree(
      element,
      childModel,
      options,
      warnOnce,
      nextPrefix);
};
```

`libs/data-binding/src/bind-value-model.ts` - the unknown pipe check, which runs
before anything is subscribed for that binding:

```ts
if (!formatter) {
  throw new Error(
    `Unknown pipe: ${pipe.name}`);
}
```

## Problem

`bindSubtree` and `bindElementAttributes` push each binding's disposer into an
array and return a disposer over that array at the end. A value binding that
fails to set up, an unknown pipe (`Unknown pipe: x`), a pipe that throws on the
first value, or a path `observe().at()` rejects, throws straight out of
`bindDataModel`. The disposers collected so far are dropped with the stack
frame; the caller gets an exception and no disposer.

```ts
const model = observable({ a: 'one', b: 'two' });

// <span id="a" data-bind-text="a"></span>
// <span id="b" data-bind-text="b | nope"></span>
try { bindDataModel(root, model); } catch { }

model.a = 'changed';
root.querySelector('#a').textContent; // 'changed'
```

The first span keeps updating: its `observe(model).at('a')` subscription is
alive, holds the element, and cannot be disposed. The same happens on a context
rebind: `bindChildren` in `bindContextElement` calls the old `childDisposer`,
then `bindSubtree` throws partway, `childDisposer` still points at the
already-run old disposer, and the new partial subscriptions leak. For a
long-lived model, every failed bind adds listeners for good.

`libs/data-binding/docs/Pipes.md`, "Errors", documents that an unknown pipe
throws and that a pipe exception propagates; it does not say the bind is not
rolled back. Rolling back is the behaviour a caller expects from a function that
either returns a disposer or throws.

Proposed behaviour: wrap the loop in `bindSubtree` (or `bindDataModel`) so that
on an exception every disposer collected so far runs before the exception
propagates, and in `bindChildren` set `childDisposer` to `null` before rebinding
so a failed rebind cannot be mistaken for a bound one. A cheaper alternative is
to validate pipes and paths for the whole subtree before subscribing anything,
so setup cannot fail halfway. Add a test that binds two elements, lets the
second fail, then changes the model and asserts the first element no longer
updates.

## Where

- `libs/data-binding/src/bind-data-model.ts` - `bindSubtree`,
  `bindElementAttributes` (the `throw error` branch for value bindings) and
  `bindContextElement` (`bindChildren`).
- `libs/data-binding/src/bind-value-model.ts` - `compilePipes` and the first
  `update()`, the two places setup throws.
- `libs/data-binding/src/watch-model-path.ts` - `observe(model).at(path)`, which
  throws for a malformed path.
- `libs/data-binding/docs/Pipes.md` - "Errors".
