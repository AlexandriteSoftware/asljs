# eslint-style-rules

## Tests

```js
const test = fn('12345678901234567890');
// ---
const test =
  fn(
    '12345678901234567890');
```

```js
const test = await fn('12345678901234567890');
// ---
const test =
  await fn(
    '12345678901234567890');
```

```js
const test1 = await fn('12345678901234567890');
const test2 = await fn('12345678901234567890');
// ---
const test1 =
  await fn(
    '12345678901234567890');

const test2 =
  await fn(
    '12345678901234567890');
```
