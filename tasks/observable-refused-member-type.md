# observable-refused-member-type

A refused member's type is `never`.

Package: `observable`. Moved from the root `TODO.md`.

`never` is right for a model that genuinely cannot be converted, and wrong for
one where the `convert` hook takes the value over. There is no way for the type
to know; the README says to type the model with the wrapper instead.

Recorded as an accepted limitation rather than scheduled work: it needs a
decision about whether the `convert` hook should be reflected in the type at
all, not an implementation.

## Where

- `observable/src/types.ts:137` — the `never` branch for unsupported values.
