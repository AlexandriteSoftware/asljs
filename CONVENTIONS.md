# Coding Conventions

## Rationale

### What was found

Analysing the TypeScript source files across `eventful`, `observable`, `money`,
and `server` packages revealed a highly consistent, intentional style:

- **Allman-like brace placement** for named function bodies: the opening `{`
  appears on its own line below the closing `)` of the parameter list.
- **Double-indented parameters** with the closing `)` on a single-indented line,
  e.g. `function foo(\n    a: A,\n    b: B\n  ): R\n{`.
- **Assignment-wrapping** pattern: `const name =` on one line, the initialiser
  expression indented on the next.
- **Period-first chaining**: each chained method call starts with `.` on a new
  line, e.g. `Object.prototype\n  .hasOwnProperty\n  .call(…)`.
- Strict ESM (`type: module`), named exports in brace-block style, no CommonJS.
- Explicit return types on all declared functions (enforced by ESLint).
- `strict: true` TypeScript with `target: ES2020` / `module: NodeNext`.
- Non-enumerable property descriptors for injected methods.
- Factory-function pattern (e.g. `eventful(obj)`) rather than subclassing.

### External conventions compared

| Guide | Verdict |
|---|---|
| [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) | K&R brace style, different indentation rules, namespace-imports encouraged — too many conflicts |
| [Airbnb JavaScript/TypeScript](https://github.com/airbnb/javascript) | K&R braces, trailing-comma rules differ, arrow-function style differs |
| [ts-standard](https://github.com/standard/ts-standard) | No semicolons by default, K&R braces — fundamentally incompatible |

### Decision

**No external baseline was adopted.** The number of exceptions that would be
required against any of the popular guides (brace placement, parameter
indentation, assignment-wrapping) would be greater than the number of shared
rules, making an external baseline misleading rather than helpful. This
document instead uses **general TypeScript best practices** as the implicit
starting point and documents this repository's conventions directly.

---

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

## 2. Project-Specific Conventions

### 2.1 Repository structure

- This is an **npm workspaces monorepo**.  Each sub-directory (`eventful`,
  `money`, `observable`, `machine`, `server`, …) is a separate workspace
  package.
- Package names are prefixed with `asljs-` and reflect the domain
  (e.g. `asljs-eventful`, `asljs-observable`).
- Each package follows the layout:

  ```
  <package>/
    src/           # TypeScript source
    tests/         # Test files (*.test.ts)
    dist/          # Compiled output (git-ignored)
    package.json
    tsconfig.json
    eslint.config.js
    README.md
    LICENSE.md
    <package>.d.ts   # Public typings entry-point
    <package>.js     # Re-export shim
  ```

### 2.2 Module and export style

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

### 2.3 TypeScript compiler settings

- `strict: true` — all strict checks enabled.
- `target: ES2020`, `module: NodeNext`, `moduleResolution: NodeNext`.
- `declaration: true` — emit `.d.ts` files alongside compiled output.
- `skipLibCheck: true`.

### 2.4 Formatting and whitespace

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
**not** apply to arrow functions (see §2.4 "Arrow functions" below).

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

### 2.5 ESLint rules (key highlights)

The root `eslint.config.js` (inherited by each workspace via their own config)
enforces:

| Rule | Setting |
|---|---|
| `quotes` | `'single'` (avoidEscape, allowTemplateLiterals) |
| `operator-linebreak` | `'before'` for `&&`, `\|\|`, `?`, `:` |
| `multiline-ternary` | `'always'` |
| `nonblock-statement-body-position` | `'below'` |
| `function-call-argument-newline` | `'consistent'` |
| `@typescript-eslint/explicit-function-return-type` | `'error'` (with expressions/HOF allowances) |
| `@typescript-eslint/no-explicit-any` | `'off'` |
| `@typescript-eslint/no-unsafe-function-type` | `'off'` |
| `@typescript-eslint/no-empty-object-type` | `'off'` |

### 2.6 Naming

- **Packages**: `asljs-<domain>` (kebab-case).
- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); camelCase for multi-word names (`observableobject.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants and enum-like values**: camelCase (not `SCREAMING_SNAKE_CASE`).
- Internal/private helpers are unexported; they live in the same file as their
  consumer.

### 2.7 API design

- Prefer **factory functions** (e.g. `eventful(obj)`) over mandatory
  subclassing.  Base classes (e.g. `EventfulBase`) are offered as a convenience
  but are not the primary API.
- Keep the public API surface **minimal, consistent, and orthogonal**; avoid
  leaking internal data structures.
- Options objects should be **explicit, optional, and default-safe**.
- Hook callbacks (tracing, error) are **opt-in** and invoked conditionally.
  Hook payloads must be stable, serializable, and must not expose mutable
  internals.

### 2.8 Error handling

- Provide a **strict vs. non-strict** behaviour contract where relevant.
- In **non-strict** flows: isolate listener/callback errors; surface them via
  error hooks or the global `eventful` error event rather than throwing.
- In **strict** flows: fail fast and document the contract explicitly.
- Validate function and object arguments at the entry point; throw
  `TypeError` with a clear message.

### 2.9 Internal state

- Use `Map` and `Set` for dynamic key/value and membership state.
- Do not expose internal collections directly; return safe views
  (e.g. spread copies, boolean results, or counters).
- Injected methods use **non-enumerable** property descriptors
  (`enumerable: false`) unless the method is intended for public iteration.
- Idempotent operations (e.g. unsubscribe closures) must return a consistent
  result (`boolean`) on repeated calls.

### 2.10 Explicit return types

All **declared functions** (function declarations, class methods) must have
explicit return types.  Inline expressions, typed function expressions,
higher-order callbacks, and arrow functions with direct `const` assertions are
exempt (matching the ESLint rule configuration).

### 2.11 Testing

- Use Node's **built-in test runner** (`node:test`).
- Test files live in `<package>/tests/` and use the `.test.ts` suffix.
- Cover happy paths, error paths, and surface-level API contracts.
- Prefer small, fast, deterministic test cases.
- Add tests whenever behaviour changes.

### 2.12 Documentation

Each package must have a `README.md` with the following sections in order:

1. **Overview** — brief description and a reference to the ASLJS monorepo.
2. **Installation** — `npm install` command with a link to the NPM package.
3. **Usage** — runnable examples (JS and TS where both are relevant).
4. **API Reference** — brief listing with links to type definitions.
5. **License** — SPDX identifier and/or link to `LICENSE.md`.

Keep README, type declarations, and runtime implementation **in sync** whenever
public contracts change.

---

## 3. Exceptions and Deviations from Common Practice

| Common practice | This repo's rule | Reason |
|---|---|---|
| K&R brace style (`{` on the same line as `)`) | Allman-like: `{` on its own line after named-function `)` | Intentional project style for readability of multi-line signatures |
| 4-space or tab indentation (some guides) | 2-space indentation | Project standard |
| `SCREAMING_SNAKE_CASE` for constants | camelCase for all constants | Consistent with the rest of the codebase |
| Avoid `any` (`@typescript-eslint/no-explicit-any: error`) | `any` is allowed (`off`) | Factory/mixin patterns require untyped intermediate values |
| Strict `Function` type banned (`no-unsafe-function-type`) | Allowed (`off`) | Public API deliberately accepts generic `Function` parameters |
| Empty object type banned (`no-empty-object-type`) | Allowed (`off`) | Used in generic constraints across the codebase |
| Arrow-function body `{` on same line as `=>` | `{` on next line after `=>` | Consistent with the project's Allman-like function body style |
| Single-line unary control bodies (`if (x) return;`) | Single-line is acceptable only when naturally short | `nonblock-statement-body-position: below` enforces body below condition |
