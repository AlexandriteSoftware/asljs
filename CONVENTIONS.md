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
- Table width should be limited to 80 characters. No linebreaks in cells.

## Naming

- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); kebab-case for composite names (`observable-object.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants and enum-like values**: camelCase, when constant is within class,
  method or function. SCREAMING_SNAKE_CASE when on file level.
- Internal/private helpers are unexported; they live in the same file as their
  consumer.

## Encapsulation

- Use `Map` and `Set` for dynamic key/value and membership state.
- Do not expose internal collections directly; return safe views (e.g. spread
  copies, boolean results, or counters).
- Injected methods use **non-enumerable** property descriptors
  (`enumerable: false`) unless the method is intended for public iteration.
- Idempotent operations (e.g. unsubscribe closures) must return a consistent
  result (`boolean`) on repeated calls.

## Explicit return types

All **declared functions** (function declarations, class methods) must have
explicit return types. Inline expressions, typed function expressions,
higher-order callbacks, and arrow functions with direct `const` assertions are
exempt (matching the ESLint rule configuration).

## Testing

- All code files (even ones containing interfaces/types only) should have a
  corresponding test file with at least basic coverage.
- Test files are named with `.test.ts` suffix and live in the same directory as
  the code they test.
