# sfmt-assignment-drops-parentheses

sfmt drops the parentheses around a cast on the left of an assignment when it
breaks the line after `=`, which turns valid TypeScript into a parse error.

Package: `sfmt`.

## Context

`fmtAssignmentExpression` rebuilds an assignment from its parts: the text of the
left side, ` =`, then the right side on the same line when it is simple, or on
the next line. The parts come from the syntax tree:

`apps/sfmt/src/ts-fmt/fmt-assignment-expression.ts`:

```ts
  const leftText =
    context.sourceCode.getText(
      node.left);

  code.push(leftText);
  code.push(' =');
```

Parentheses are not nodes in the tree. `node.left` of `(element[name] as
unknown) = value` is the `as` expression, and its text is `element[name] as
unknown`, without the parentheses around it.

## Problem

Given

```ts
export function write(
    element: HTMLElement,
    name: keyof HTMLElement,
    value: unknown
  ): void
{
  (element[name] as unknown) = value ? '' : value;
}
```

`sfmt format` writes

```ts
element[name] as unknown =
  value
  ? ''
  : value;
```

which does not parse (`';' expected`). The same happens whatever the right side
is, once it is not simple enough to stay on the line: a conditional, a `||`
chain. A short assignment such as `(element[name] as unknown) = value;` is left
alone, which is why the pattern survives in `libs/data-binding` until the right
side grows. It surfaced there, in `write-binding-value.ts`, where `toolkit
flint` then failed with a parse error from eslint; that code computes the value
into a variable first to avoid it.

The right side is read the same way (`getText(nodeRight)`), but a parenthesised
right side such as `a = (b, c)` was left as it is in the same check, so only the
left side is confirmed.

Proposed behaviour: take the text of each side with its enclosing parentheses,
for example by extending the range to the parenthesis tokens around the node
(`getTokenBefore` / `getTokenAfter` while they are `(` and `)`), and add the
case to `apps/sfmt/src/ts-style-rules/assignment-expression.md`, which the rule
tests are built from. Check the other formatters that rebuild text from
`getText(node.x)` for the same loss.

## Where

- `apps/sfmt/src/ts-fmt/fmt-assignment-expression.ts` - `leftText` and
  `rightText`.
- `apps/sfmt/src/ts-style-rules/assignment-expression.md` - the rule's test
  cases.
- `apps/sfmt/src/ts-fmt/` - the other formatters that call `getText` on child
  nodes.
