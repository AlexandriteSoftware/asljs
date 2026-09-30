# type-alias-declaration

## Tests

```ts
type TestFn = (
  name?: string,
  fn?: test.TestFn
) => Promise<void>;
// ---
type TestFn =
  (
    name?: string,
    fn?: test.TestFn
  ) =>
    Promise<void>;
```
