# ASLJS Observable AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-observable`.

This package makes objects, arrays, and primitive boxes emit change events and
supports path-based watching.

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
  current public guidance.
- `shallow: true` must remain top-level-only conversion.

## Validation

- `npm -w asljs-observable run test`
- `npm -w asljs-observable run typecheck`
- `npm -w asljs-observable run lint`

Update this file when AI-facing constraints, preserved payload semantics, or
validation commands change. Update `README.md` separately only when
user-facing behavior changes.
