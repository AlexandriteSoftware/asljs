# eslint-variable-declaration-style-rule

## Tests

```js
let a = 1;
// ---
let a = 1;
```

```js
let a =
  test;
// ---
let a =
  test;
```

```js
let a = '12345678901234567890';
// ---
let a =
  '12345678901234567890';
```

```js
let a = `
12345678901234567890`;
// ---
let a =
  `
12345678901234567890`;
```

```js
let a = fn(a, b);
// ---
let a =
  fn(a, b);
```
