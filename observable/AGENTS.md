# ASLJS Observable AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-observable`.

This package makes plain objects, arrays, and primitive boxes emit change
events and supports path-based watching.

## Package Scope

Exports from `src/index.ts`:

- `observable`
- `ObservableObject`
- observable-related event, options, trace, and watch types

## Preferred Usage Patterns

- Use `observable(value, options?)` to wrap plain objects, arrays, or
  primitives.
- Use `.watch(pathOrPaths, callback)` for path-based reactive reads.
- Use `ObservableObject` when implementing a class with explicit getters and
  setters.
- Keep change notifications expressed through `set`, `delete`, and `define`
  events.

## Constraints To Preserve

- Objects, arrays, and primitive boxes have different payload shapes; do not
  merge them into a vague generic payload.
- More specific events fire before the generic event, for example `set:a`
  before `set`.
- `watch(...)` runs immediately with current values and returns an unsubscribe
  function.
- Nested path watching is supported where an observable/eventful segment exists
  along the path.
- Arrays are not supported by `watch(...)` yet and that limitation is part of
  current public guidance. `ObservableArray` carries no `watch` in its type, so
  the failure lands at compile time for TypeScript callers.
- `watch(...)` paths are typed with `WatchPath`/`WatchPathValue`. Keep
  `WatchMethod` parameterised on the bare model, never on `T & Eventful<...>`,
  or the eventful methods become watchable properties again. The depth cap in
  `WatchPath` is required: without it a self-referential model recurses
  forever.
- Shortening an array emits a `delete` pair per dropped element, furthest
  index first, before the `set:length` pair. Holes are skipped, and elements
  that `pop`, `shift` or `splice` already deleted must not be reported again.
- `shallow: true` must remain top-level-only conversion.
- Only plain objects (`{}` literals and null-prototype objects) and arrays are
  converted. Every other value is opaque: stored as-is when nested, boxed into
  `{ value }` when it is the top-level target. Do not widen this without also
  giving the new kind its own payload shape.
- Opaque values keep their identity; replacing one still emits `set`.
- Non-extensible values (frozen, sealed, `preventExtensions`) are opaque: the
  eventful API cannot be attached to them.
- An opaque value passed as the top-level target throws a `TypeError`. Do not
  go back to boxing it: the box reads as undefined for every property the
  caller expects and fails silently.
- Nested members are typed through `ObservableMembers`, and carry the full
  Eventful API and `watch`. A member of an observable holds an observable, so
  TypeScript rejects assigning a plain object and the value is wrapped first.
  The runtime still converts a plain value assigned from JavaScript, with the
  parent's options, which an explicitly wrapped value does not inherit.
- The package ships no wrappers for `Date`, `Map`, `Set` or any other opaque
  kind, and must not start shipping them. Callers add their own through the
  `convert` hook, which is consulted for every object before the built-in rule
  and whose results join the identity map.
- Conversion visits only writable data properties. Accessors stay accessors
  and their getters must not run during conversion; non-writable members and
  array holes are skipped.
- One target maps to one wrapper for the whole conversion. Repeated and cyclic
  references must resolve to the same observable, so the identity map is
  threaded through the recursion and the wrapper is registered before its
  members are converted.
- Values that already carry the Eventful API are never re-wrapped.

## Validation

- `npm -w asljs-observable run test`
- `npm -w asljs-observable run typecheck`
- `npm -w asljs-observable run lint`

Update this file when AI-facing constraints, preserved payload semantics, or
validation commands change. Update `README.md` separately only when
user-facing behavior changes.
