# Coding Conventions

## 1. Baseline — General TypeScript Best Practices

The following widely-accepted TypeScript practices apply here unless a
project-specific rule below overrides them.

- Write type-safe code; avoid `any` unless unavoidable.
- Prefer `interface` for public API shapes; use `type` for unions, aliases, and
  computed types.
- Prefer `const` over `let`; avoid `var`.
- Use `===` / `!==` for equality.
- Export only what consumers need; keep internals unexported.
- Write deterministic, side-effect-free pure functions where possible.
- Prefer `Map` and `Set` over plain objects for dynamic key/value storage.

---

## 2. Conventions

### 2.1 Module and export style

- All packages use **ESM** (`"type": "module"` in `package.json`).
- CommonJS (`require`, `module.exports`) is not used.
- Use named exports in **brace-block style**, one name per line:

  ```ts
  export {
    foo,
    bar,
  } from './module.js';
  ```

- Separate type-only imports with `import type { … }`.
- Use multi-line brace-block for imports when importing more than one name:

  ```ts
  import {
      alpha,
      beta,
    } from './module.js';
  ```

- Always include the `.js` extension in local import paths (NodeNext
  resolution).

### 2.2 TypeScript compiler settings

- `strict: true` — all strict checks enabled.
- `target: ES2020`, `module: NodeNext`, `moduleResolution: NodeNext`.
- `declaration: true` — emit `.d.ts` files alongside compiled output.
- `skipLibCheck: true`.

### 2.3 Formatting and whitespace

#### Indentation

- **2-space** indentation throughout.
- Function parameters are **double-indented** (4 spaces); the closing `)` is
  **single-indented** (2 spaces).

#### Semicolons

- **Always** use semicolons.

#### Quotes

- **Single quotes** for all strings.  Template literals are allowed when
  interpolation is needed.  Escape-avoidance is permitted (e.g. `"it's"` is
  acceptable in place of `'it\'s'`).

#### Line length and wrapping

- Prefer **multi-line formatting** over long single lines.  Wrap at logical
  boundaries (after a comma, before an operator).

#### Brace placement — named functions

Named function bodies use **Allman-style braces**: the opening `{` is on its
own line after the closing `)`:

```ts
function greet(
    name: string,
    greeting: string
  ): string
{
  return `${greeting}, ${name}!`;
}
```

This applies to **named function declarations** and **class methods**.  It does
**not** apply to arrow functions (see §2.3 "Arrow functions" below).

#### Function parameter style

Multi-parameter function signatures use one parameter per line, double-indented,
with the closing `)` on a single-indented line followed by the return type:

```ts
function example(
    firstParam: string,
    secondParam: number,
    thirdParam: boolean
  ): void
{
  // …
}
```

#### Assignment wrapping

For complex initialisers, place `const name =` on its own line and start the
expression on the next line with 2-space indentation:

```ts
const result =
  someComplexExpression(
    a,
    b);
```

#### Arrow functions

Arrow function blocks place the opening `{` on the **next line after `=>`**:

```ts
const handler =
  (event: string): void =>
  {
    doSomething(event);
  };
```

Short single-expression arrow functions may remain inline when they fit
naturally.

#### Chained calls

Fluent/chained method calls place the `.` at the **start of each continuation
line**:

```ts
Object.prototype
  .hasOwnProperty
  .call(obj, key);
```

#### Multi-line boolean expressions

Place `&&` and `||` at the **start** of continuation lines, aligned with the
opening condition:

```ts
if (isValid
  && isEnabled
  && hasPermission)
{
  // …
}
```

Ternary expressions always span multiple lines (`multiline-ternary: always`):

```ts
const label =
  condition
    ? 'yes'
    : 'no';
```

#### Trailing commas

Use **trailing commas** in all multi-line import lists, export lists, parameter
lists, object literals, and array literals.

#### Blank lines

Keep a blank line between logical sections: imports, internal helpers, main
implementation, and exports.

### 2.4 Naming

- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); camelCase for multi-word names (`observableobject.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants and enum-like values**: camelCase (not `SCREAMING_SNAKE_CASE`).
- Internal/private helpers are unexported; they live in the same file as their
  consumer.

### 2.5 API design

- Prefer **factory functions** (e.g. `eventful(obj)`) over mandatory
  subclassing.  Base classes (e.g. `EventfulBase`) are offered as a convenience
  but are not the primary API.
- Keep the public API surface **minimal, consistent, and orthogonal**; avoid
  leaking internal data structures.
- Options objects should be **explicit, optional, and default-safe**.
- Hook callbacks (tracing, error) are **opt-in** and invoked conditionally.
  Hook payloads must be stable, serializable, and must not expose mutable
  internals.

### 2.6 Error handling

- Provide a **strict vs. non-strict** behaviour contract where relevant.
- In **non-strict** flows: isolate listener/callback errors; surface them via
  error hooks or the global `eventful` error event rather than throwing.
- In **strict** flows: fail fast and document the contract explicitly.
- Validate function and object arguments at the entry point; throw
  `TypeError` with a clear message.

### 2.7 Internal state

- Use `Map` and `Set` for dynamic key/value and membership state.
- Do not expose internal collections directly; return safe views
  (e.g. spread copies, boolean results, or counters).
- Injected methods use **non-enumerable** property descriptors
  (`enumerable: false`) unless the method is intended for public iteration.
- Idempotent operations (e.g. unsubscribe closures) must return a consistent
  result (`boolean`) on repeated calls.

### 2.8 Explicit return types

All **declared functions** (function declarations, class methods) must have
explicit return types.  Inline expressions, typed function expressions,
higher-order callbacks, and arrow functions with direct `const` assertions are
exempt (matching the ESLint rule configuration).

### 2.9 Testing

- Use Node's **built-in test runner** (`node:test`).
- Cover happy paths, error paths, and surface-level API contracts.
- Prefer small, fast, deterministic test cases.
- Add tests whenever behaviour changes.

### 2.10 Documentation

Each package must have a `README.md` with the following sections in order:

1. **Overview** — brief description.
2. **Installation** — `npm install` command.
3. **Usage** — runnable examples (JS and TS where both are relevant).
4. **API Reference** — brief listing with links to type definitions.
5. **License** — SPDX identifier and/or link to `LICENSE.md`.

Keep README, type declarations, and runtime implementation **in sync** whenever
public contracts change.
