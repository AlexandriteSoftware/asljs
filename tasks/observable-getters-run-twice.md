# Getters run more than once per change

Package: `observable`. Moved from the root `TODO.md`.

The `set` trap calls `Reflect.get` for `previous` and again for `current`, and
the `defineProperty` trap does the same, so an accessor property has its getter
run twice per reported change. `truncation` is a third site: it reads
`target[index]` for every element a `length` assignment drops, so clearing an
array runs the getters of the elements it removes.

Documented for `defineProperty`, where installing a getter has to run it to
report a value; undocumented for the rest.

## Where

- `observable/src/observable.ts:480` — `previous` in the `set` trap.
- `observable/src/observable.ts:537` — `current` in the same trap.
- `observable/src/observable.ts:614` and `:634` — the same pair in
  `defineProperty`.
- `observable/src/observable.ts:211` — `truncation`, called from `:490`.
