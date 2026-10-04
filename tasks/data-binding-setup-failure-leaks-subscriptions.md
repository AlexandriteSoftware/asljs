# data-binding-setup-failure-leaks-subscriptions

When `bindDataModel` throws during setup, the subscriptions it had already
created stay attached to the model with no way to release them.

Package: `data-binding`.

`bindSubtree` and `bindElementAttributes` push each binding's disposer into an
array and return a disposer over that array at the end. A value binding that
fails to set up, an unknown pipe (`Unknown pipe: x`), a pipe that throws on
the first value, or a path `observe().at()` rejects, throws straight out of
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
alive, holds the element, and cannot be disposed. The same happens on a
context rebind: `bindChildren` in `bindContextElement` calls the old
`childDisposer`, then `bindSubtree` throws partway, `childDisposer` still
points at the already-run old disposer, and the new partial subscriptions
leak. For a long-lived model, every failed bind adds listeners for good.

`README.md` documents that an unknown pipe throws; it does not say the bind is
not rolled back. Rolling back is the behaviour a caller expects from a function
that either returns a disposer or throws.

Proposed behaviour: wrap the loop in `bindSubtree` (or `bindDataModel`) so
that on an exception every disposer collected so far runs before the exception
propagates, and in `bindChildren` set `childDisposer` to `null` before
rebinding so a failed rebind cannot be mistaken for a bound one. A cheaper
alternative is to validate pipes and paths for the whole subtree before
subscribing anything, so setup cannot fail halfway. Add a test that binds two
elements, lets the second fail, then changes the model and asserts the first
element no longer updates.

## Where

- `libs/data-binding/src/bind-data-model.ts` - `bindSubtree`,
  `bindElementAttributes` (the `throw error` branch for value bindings) and
  `bindContextElement` (`bindChildren`).
- `libs/data-binding/src/bind-value-model.ts` - `compilePipes` and the first
  `update()`, the two places setup throws.
