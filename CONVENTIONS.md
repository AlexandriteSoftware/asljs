# Conventions

This document contains conventions and recommendataions that are not enforceable
by tooling.

## TypeScript

- Prefer `interface` for public API shapes; use `type` for unions, aliases, and
  computed types.
- Prefer `Map` and `Set` over plain objects for dynamic key/value storage.

## Documentation style

- Prefer lists and short prose over tables in repository documentation.
- When documentation explains a choice, routing rule, or selection logic, prefer
  an explicit decision tree or `if ... then ...` list over a matrix.
- Use tables only when the information is inherently tabular and would become
  less clear as prose or lists, for example dense payload reference data.
- When a table is necessary, keep it compact and use it for reference rather
  than for primary decision-making guidance.
- No linebreaks in table cells.

## Naming

- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); kebab-case for composite names (`observable-object.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants**: SCREAMING_SNAKE_CASE only for file-level values that are deeply
  immutable, such as primitives and frozen literals. Everything else is
  camelCase, including file-level bindings that hold mutable objects or
  constructed services, and any constant declared inside a class, method, or
  function.

## Encapsulation

- Do not expose internal collections directly; return safe views (e.g. spread
  copies, boolean results, or counters).
- Injected methods use **non-enumerable** property descriptors
  (`enumerable: false`) unless the method is intended for public iteration.
- Idempotent operations (e.g. unsubscribe closures) are safe to call repeatedly
  and report whether the call did anything: the first call returns `true`, and
  every later call returns `false` without side effects.

## Testing

- Every file with runtime behaviour has a corresponding test file with at least
  basic coverage.
- Files that contain only types and interfaces are exempt from runtime tests.
  Where a generic or conditional type carries real logic, cover it with
  type-level assertions (`@ts-expect-error` for shapes that must not compile,
  equality assertions for shapes that must) rather than with runtime assertions,
  which cannot observe a type at all.
- Unexported helpers are covered through the public API that uses them; do not
  export something solely to make it testable.
- Test files are named with `.test.ts` suffix and live in the same directory as
  the code they test.
