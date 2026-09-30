# observable-cross-realm-plain-objects

Cross-realm plain objects are refused.

Package: `observable`. Moved from the root `TODO.md`.

`isPlainObject` compares against this realm's `Object.prototype`, so a literal
from a `vm` context or an iframe is not convertible. Under throw-by-default that
is no longer a silent degradation but a refusal, which raises the stakes.

Widen with an `Object.prototype.toString` fallback if it bites.

## Where

- `observable/src/guards.ts:37` — `prototype === Object.prototype`.
