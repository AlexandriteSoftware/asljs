# statement-spacing

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

```js
  fn(a);
  await fn(
    a,
    b);
// ---
  fn(a);

  await fn(
    a,
    b);
```

```js
import { a }
  from 'a';
import { b }
  from 'b';
// ---
import { a }
  from 'a';
import { b }
  from 'b';
```
