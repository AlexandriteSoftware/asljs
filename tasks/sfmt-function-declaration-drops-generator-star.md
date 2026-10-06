# sfmt-function-declaration-drops-generator-star

sfmt drops the `*` of a generator function declaration when it reformats one,
which turns valid TypeScript into a type error.

Package: `sfmt`.

## Context

`fmtFunctionDeclaration` rebuilds a declaration from its parts: `async ` when
`node.async` is set, then `function `, the name, the parameters, the return type
and the body. It never looks at `node.generator`.

`apps/sfmt/src/ts-fmt/fmt-function-declaration.ts`:

```ts
if (node.async) {
  code.push('async ');
}
```

## Problem

Given

```ts
export function* numbers(limit: number): Generator<number> {
  yield limit;
}

export async function* lines(): AsyncGenerator<string> {
  yield "a";
}
```

`sfmt format` writes

```ts
export function numbers(
    limit: number
  ): Generator<number>
{
  yield limit;
}

export async function lines(
  ): AsyncGenerator<string>
{
  yield 'a';
}
```

Without the `*`, `yield` is an identifier: `tsc` reports TS1214 and TS1163. It
surfaced in `libs/data-binding/src/compile-templates-cli.ts`, whose `async
function* walk` `toolkit flint` broke; that code collects into an array instead.

Proposed behaviour: write `function* ` when `node.generator` is set, add both
cases to `apps/sfmt/src/ts-style-rules/function-declaration.md`, and check the
other formatters that rebuild a function (`fmt-array-function-expression.ts`
handles arrows, which cannot be generators, but methods and function expressions
may reach other rules).

## Where

- `apps/sfmt/src/ts-fmt/fmt-function-declaration.ts` - the missing `*`.
- `apps/sfmt/src/ts-style-rules/function-declaration.md` - the rule's test
  cases.
