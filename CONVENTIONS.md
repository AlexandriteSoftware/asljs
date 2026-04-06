# Coding Conventions

## Baseline — General TypeScript Best Practices

The following widely-accepted TypeScript practices apply here unless a
project-specific rule below overrides them.

- Write type-safe code; avoid `any` unless the exception is clearly documented.
- Prefer `interface` for public API shapes; use `type` for unions, aliases, and
  computed types.
- Prefer `const` over `let`; avoid `var`.
- Use `===` / `!==` for equality.
- Export only what consumers need; keep internals unexported.
- Write deterministic, side-effect-free pure functions where possible.
- Prefer `Map` and `Set` over plain objects for dynamic key/value storage.

---

## Conventions

### Module and export style

- All packages use **ESM** (`"type": "module"` in `package.json`).
- CommonJS (`require`, `module.exports`) is not used.
- Use named exports and imports in **brace-block style**: one name per
  double-indented line, with `}` or `} from` on a single-indented line:

  ```ts
  export {
      foo,
      bar,
    } from './module.js';
  ```

  ```ts
  import {
      alpha,
      beta,
    } from './module.js';
  ```

- For type-only names, use the inline `type` keyword rather than a separate
  `import type { … }` statement:

  ```ts
  import {
      type Alpha,
      beta,
    } from './module.js';
  ```

- Always include the `.js` extension in local import paths (NodeNext
  resolution).

### TypeScript compiler settings

- `strict: true` — all strict checks enabled.
- `target: ES2020`, `module: NodeNext`, `moduleResolution: NodeNext`.

### Formatting and whitespace

#### Indentation

- **2-space** indentation throughout.

#### Semicolons

- **Always** use semicolons.

#### Quotes

- **Single quotes** for all strings.  Template literals are allowed when
  interpolation is needed.  Escape-avoidance is permitted (e.g. `"it's"` is
  acceptable in place of `'it\'s'`).

#### Line length and wrapping

- Prefer **multi-line formatting** over long single lines.  Wrap at logical
  boundaries (after a comma, before an operator, after `;` in `for` loops).

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
**not** apply to arrow functions (see "Arrow functions" below).

#### Function parameter style

Multi-parameter function signatures use one parameter per double-indented line,
with the closing `)` on a single-indented line.  The return type follows on the
same line as `)`, and is always required — even when `void`:

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
start of the expression:

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

#### Object and array literals

For multi-line **object literals**, place the first key on the same line as
the opening `{`, double-indent the value on the next line, and close with `}`
on the same line as the last value:

```ts
const options =
  { verbose:
      true };

const config =
  { server:
      { host: 'localhost',
        port: 3000 } };
```

A more complex example with mixed types:

```ts
const settings =
  { retries:
      3,
    backoff:
      { initial: 100,
        max: 5000 },
    tags:
      [ 'prod',
        'v2' ] };
```

For multi-line **array literals**, place the first element on the same line as
`[`, indent subsequent elements to align with the first, and close with `]` on
the same line as the last element:

```ts
const items =
  [ 'alpha',
    'beta',
    'gamma' ];
```

Short arrays whose elements fit on one line may remain inline:

```ts
const flags = [true, false];
const pair = [a, b];
```

#### Blank lines

Keep a blank line between logical sections: imports, internal helpers, main
implementation, and exports.

### Naming

- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); kebab-case for composite names (`observable-object.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants and enum-like values**: camelCase (not `SCREAMING_SNAKE_CASE`).
- Internal/private helpers are unexported; they live in the same file as their
  consumer.

### Error handling

- Provide a **strict vs. non-strict** behaviour contract where relevant.
- In **non-strict** flows: isolate listener/callback errors; surface them via
  error hooks or the global `eventful` error event rather than throwing.
- In **strict** flows: fail fast and document the contract explicitly.
- Validate function and object arguments at the entry point; throw
  `TypeError` with a clear message.

### Internal state

- Use `Map` and `Set` for dynamic key/value and membership state.
- Do not expose internal collections directly; return safe views
  (e.g. spread copies, boolean results, or counters).
- Injected methods use **non-enumerable** property descriptors
  (`enumerable: false`) unless the method is intended for public iteration.
- Idempotent operations (e.g. unsubscribe closures) must return a consistent
  result (`boolean`) on repeated calls.

### Explicit return types

All **declared functions** (function declarations, class methods) must have
explicit return types.  Inline expressions, typed function expressions,
higher-order callbacks, and arrow functions with direct `const` assertions are
exempt (matching the ESLint rule configuration).

### Testing

- Use Node's **built-in test runner** (`node:test`).
