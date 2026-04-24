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

## AI Quick Reference

Main exports:

- `eventful` to add event methods to an object or instance
- `EventfulBase` for class hierarchies that should be event-capable by design
- `isEventfulLike` and `asEventfulLike` for compatibility checks
- `Eventful`, `EventMap`, `EventfulOptions`, `Listener`, and related types for
  TypeScript usage
- `ListenerError` for listener-failure handling

Choose this API when:

- plain object or existing instance needs events -> use `eventful(target)`
- class hierarchy is under your control -> use `EventfulBase`
- class cannot change inheritance -> call `eventful(this)` in the constructor
- code needs to accept unknown values safely -> use `isEventfulLike` or
  `asEventfulLike`
- TypeScript event signatures matter -> define an event map and use the
  exported eventful types

Stable public behaviors:

- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`
- the package-level `eventful` function is also a global emitter
- strict mode propagates listener errors
- non-strict mode routes listener failures through the configured error path
- `trace`, `strict`, and `error` are public option behaviors

Special behavior:

- `eventful` is both the object enhancer and the package-level global emitter
- lifecycle, trace, and listener-error changes must preserve that global
  emitter contract

Do not assume:

- DOM `EventTarget` terminology or behavior maps directly to this package
- event bubbling or capture semantics exist here
- wildcard events are supported
- listener return values control emit flow
- strict mode is the default

Avoid this when:

- you are removing or bypassing the global-emitter behavior of `eventful`
- you are introducing heavier abstractions where object enhancement is enough

Common mistakes:

- treating `eventful(target)` and `EventfulBase` as interchangeable style only
  rather than a design choice
- forgetting that strict and non-strict error flows are intentionally different
- changing trace or lifecycle behavior without preserving package-level
  `eventful` events
- using internal source files instead of the package-root export surface

## Preferred Usage Patterns

- Use `eventful(target)` to enhance plain objects or class instances.
- Use `EventfulBase` when inheritance is already the natural design.
- In TypeScript, declare event maps and use the exported `Eventful<...>` types
  to preserve listener signatures.
- Prefer package event semantics over DOM `EventTarget` semantics when working
  inside this package.

## Stable Behavior

Treat these as public contract behaviors that should not drift silently:

- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`
- `eventful` also acts as a package-level global emitter
- strict mode propagates listener errors
- non-strict mode isolates listener failures through the configured error path
- `ListenerError` protects against recursive failures in global error handling

## Constraints To Preserve

- The core object API is `on`, `once`, `off`, `emit`, `emitAsync`, and `has`.
- The package-level `eventful` function is also a global emitter for lifecycle
  and error events; do not remove that behavior silently.
- `trace`, `strict`, and `error` options are documented public behavior.
- Strict mode propagates listener errors; non-strict flows route them through
  the configured error handler.
- Keep the library lightweight and object-oriented; avoid introducing heavier
  abstractions unless explicitly requested.

## Change Safety Checklist

- If changing error behavior, then verify both strict and non-strict flows.
- If changing trace behavior, then verify both package-level and per-instance
  trace paths.
- If changing lifecycle events, then preserve the package-level global emitter
  behavior.
- If changing typing, then preserve listener signatures in the TypeScript
  usage patterns.

## Validation

- `npm -w asljs-eventful run test`
- `npm -w asljs-eventful run typecheck`
- `npm -w asljs-eventful run lint`

## Related Packages

- If the task is really about property change tracking, move to
  `asljs-observable`.
- If the task is really about DOM binding or browser template updates, move to
  `asljs-data-binding`.

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update `README.md` separately only when
user-facing behavior changes.
