# conditional-expression

## Tests

```ts
const result = condition ? whenTrue : whenFalse;
// ---
const result = condition
  ? whenTrue
  : whenFalse;
```

```ts
const result: string = condition ? whenTrue : whenFalse;
// ---
const result: string = condition
  ? whenTrue
  : whenFalse;
```

```ts
const result =
  condition
  ? whenTrue
  : whenFalse;
// ---
const result =
  condition
  ? whenTrue
  : whenFalse;
```

Parentheses around the parts are kept:

```ts
const result = (a, b) ? (c, d) : (f, g);
// ---
const result = (a, b)
  ? (c, d)
  : (f, g);
```
