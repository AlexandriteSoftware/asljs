# Coding Conventions

## Baseline — General TypeScript Best Practices

The following widely-accepted TypeScript practices apply here unless
the exception is clearly documented.

Anything enforcable by the TypeScript compiler or ESLint is assumed to be in
the corresponding configuration file. This file is only for conventions that are
not enforceable by tooling, or for additional guidance on code style.

- Prefer `interface` for public API shapes; use `type` for unions, aliases, and
  computed types.
- Export only what consumers need; keep internals unexported.
- Write deterministic, side-effect-free pure functions where possible.
- Prefer `Map` and `Set` over plain objects for dynamic key/value storage.

## Conventions

### Documentation style

- Prefer lists and short prose over tables in repository documentation.
- When documentation explains a choice, routing rule, or selection logic,
  prefer an explicit decision tree or `if ... then ...` list over a matrix.
- Use tables only when the information is inherently tabular and would become
  less clear as prose or lists, for example dense payload reference data.
- When a table is necessary, keep it compact and use it for reference rather
  than for primary decision-making guidance.

### Module and export style

- All packages use **ESM** (`"type": "module"` in `package.json`).
- CommonJS (`require`, `module.exports`) is not used.

### TypeScript compiler settings

- `strict: true` — all strict checks enabled.
- `target: ES2020`, `module: NodeNext`, `moduleResolution: NodeNext`.

### Formatting and whitespace

#### Indentation

- **2-space** indentation throughout, unless otherwise required by the syntax
  (e.g. multi-line function parameters, object literals, if statements,
  for loops).

#### Semicolons

- **Always** use semicolons.

#### Quotes

- **Single quotes** for all strings.  Template literals are allowed when
  interpolation is needed.  Escape-avoidance is permitted (e.g. `"it's"` is
  acceptable in place of `'it\'s'`).

#### Line length and wrapping

- Prefer **multi-line formatting** over long single lines.  Wrap at logical
  boundaries (after a comma, before an operator, after `;` in `for` loops).

  ```ts
  [ first,
    second,
    third ]

  for (
    let rowIndex = 0;
    rowIndex < limit;
    rowIndex++
  ) {
    // ...
  }

  (
      context: MyContextObject,
      parameters: Parameter[]
    ) =>
  {
  ```

- Prefer short similar items on the same line. E.g.,

  ```ts
  [ a, b, c ]

  [ 1, 2, 3, 4 ]

  for (let i = 1; i < 10; i++) {

  (a, b, c) => {
  ```

#### Brace placement — named functions

The opening `{` before named function bodies is on its own line after the
closing `)`:

```ts
function greet(
    name: string,
    greeting: string
  ): string
{
  return `${greeting}, ${name}!`;
}
```

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

Parameter types should always be specified.

#### Assignment wrapping

For complex initialisers, place `const name =` on its own line and start the
expression on the next line with 2-space indentation:

```ts
const result =
  someComplexExpression(
    argumentValue1,
    argumentValue2);
```

#### Arrow functions

Arrow function blocks place the opening `{` on the **next line after `=>`**:

```ts
const handler =
  (
      event: string,
      details: EventDetails
    ): void =>
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
the opening `{`. If value is multi-line, double-indent the value on the next
line. Close with `}` on the same line as the last value:

```ts
const options =
  { verbose: true };

const config =
  { server:
      { host: 'localhost',
        port: 3000 } };
```

A more complex example with mixed types:

```ts
const settings =
  { retries: 3,
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
const flags = [ true, false ];
const pair = [ a, b ];
```

Spaces in object and array literals:

- One space inside empty literals: `{ }` and `[ ]`.
- Add spaces after `[` and before `]` in non-empty arrays: `[ a, b, c ]`.
- Add spaces after `{` and before `}` in non-empty objects: `{ key: value }`.

#### Blank lines

Keep a blank line between logical sections: imports, internal helpers, main
implementation, and exports.

#### Return statements

When returning a long function call or complex expression, keep return on its
own line and wrap the expression arguments onto aligned continuation lines.

```ts
return someComplexExpression(
         argumentValue1,
         argumentValue2);
```

```ts
return { key1: value1,
         key2: value2 };
```

```ts
return condition
         ? 'yes'
         : 'no';
```

### Union types

When defining union types, place each member on a separate line, starting with
`|`, aligned with the first member:

```ts
type Status =
  | 'pending'
  | 'active'
  | 'completed';
```

### Naming

- **Files**: lowercase, no separators for single-concept files (`types.ts`,
  `guards.ts`); kebab-case for composite names (`observable-object.ts`).
- **Functions and variables**: camelCase.
- **Types, interfaces, and classes**: PascalCase.
- **Constants and enum-like values**: camelCase, when constant is within
  class, method or function. SCREAMING_SNAKE_CASE when on file level.
- Internal/private helpers are unexported; they live in the same file as their
  consumer.

### Error handling

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
- All code files (even ones containing interfaces/types only) should have
  a corresponding test file with at least basic coverage.
- Test files are named with `.test.ts` suffix and live in the same directory as
  the code they test.
