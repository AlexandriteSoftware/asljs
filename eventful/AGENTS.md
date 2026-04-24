# ASLJS Eventful AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-eventful`.

This package adds lightweight event methods to plain objects and provides a
base class for event-capable types.

## Package Scope

Exports from `src/index.ts`:

- `eventful`
- `EventfulBase`
- `EventfulLike`, `isEventfulLike`, `asEventfulLike`
- event-related types and `ListenerError`

## Preferred Usage Patterns

- Use `eventful(target)` to enhance plain objects or class instances.
- Use `EventfulBase` when inheritance is already the natural design.
- In TypeScript, declare event maps and use the exported `Eventful<...>` types
  to preserve listener signatures.
- Prefer package event semantics over DOM `EventTarget` semantics when working
  inside this package.

## Constraints To Preserve

- The core object API is `on`, `once`, `off`, `emit`, `emitAsync`, and `has`.
- The package-level `eventful` function is also a global emitter for lifecycle
  and error events; do not remove that behavior silently.
- `trace`, `strict`, and `error` options are documented public behavior.
- Strict mode propagates listener errors; non-strict flows route them through
  the configured error handler.
- Keep the library lightweight and object-oriented; avoid introducing heavier
  abstractions unless explicitly requested.

## Validation

- `npm -w asljs-eventful run test`
- `npm -w asljs-eventful run typecheck`
- `npm -w asljs-eventful run lint`

When exported runtime behavior changes, update `README.md` and this file.
