# eslint-statement-spacing-style-rule

## Tests

```js
await fn(a);
fn(a);
// ---
await fn(a);
fn(a);
```

```js
await fn(
  a,
  b);
fn(a);
// ---
await fn(
  a,
  b);

fn(a);
```
