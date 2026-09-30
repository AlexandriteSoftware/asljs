# observable-array-get-trap-unmeasured

The `get` trap on arrays has not been measured.

Package: `observable`. Moved from the root `TODO.md`.

It runs on every read of a converted array, not only on the nine methods it
wraps, and does a `Map` lookup plus a `Reflect.get` identity check for a string
key. Cheap by inspection, unmeasured in practice.

Measure before adding anything else to it. The repository has no benchmark for
it today.

## Where

- `observable/src/observable.ts:849` — the trap and its wrapped-method lookup.
