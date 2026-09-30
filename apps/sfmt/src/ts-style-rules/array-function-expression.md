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

Special case: if the arrow has an empty body and no parameters, it is formatted
as a single line:

```ts
const map =
  items.map(
    () =>
    {
    });
// ---
const map =
  items.map(
    () => { });
```

```ts
const map =
  items.map(
    (): void =>
    {
    });
// ---
const map =
  items.map(
    (): void => { });
```

Comments are preserved:

```ts
const map =
  items.map(
    (): void =>
    {
      // do nothing
    });
// ---
const map =
  items.map(
    (): void =>
    {
      // do nothing
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
