# statement-spacing

## Tests

```ts
await fn(a);
fn(a);
// ---
await fn(a);
fn(a);
```

```ts
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

```ts
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

```ts
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

```ts
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

```ts focus
type A =
  (
    a: string,
    b: string
  ) => void;
export type B =
  (
    a: string,
    b: string
  ) => void;
// ---
type A =
  (
    a: string,
    b: string
  ) => void;

export type B =
  (
    a: string,
    b: string
  ) => void;
```
