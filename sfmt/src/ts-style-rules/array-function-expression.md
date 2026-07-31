# arrayfunctionexpression

## Tests

Expression-bodied arrows are not modified:

```ts
const map =
  x => x * 2;
// ---
const map =
  x => x * 2;
```

Block-bodied arrows are formatted similarly to function declarations:

```ts
const map =
  items.map(
    () => {
      return value * 2;
    });
// ---
const map =
  items.map(
    () =>
    {
      return value * 2;
    });
```

```ts
const map =
  items.map(
    value => {
      return value * 2;
    });
// ---
const map =
  items.map(
    (
        value
      ) =>
    {
      return value * 2;
    });
```

Async typed arrows are also chopped:

```ts
const map =
  items.map(
    async (value: number): Promise<number> => {
      return value * 2;
    });
// ---
const map =
  items.map(
    async (
        value: number
      ): Promise<number> =>
    {
      return value * 2;
    });
```

```ts
const map =
  items.map(
    async (value: number, format: string): Promise<number> => {
      return value * 2;
    });
// ---
const map =
  items.map(
    async (
        value: number,
        format: string
      ): Promise<number> =>
    {
      return value * 2;
    });
```
