# variable-declaration

## Tests

```js
let a;
const a;
var a;
using a;
await using a;
// ---
let a;
const a;
var a;
using a;
await using a;
```

```js
let a = 1;
const a = 1;
var a = 1;
using a = 1;
await using a = 1;
// ---
let a = 1;
const a = 1;
var a = 1;
using a = 1;
await using a = 1;
```

```js
let a = -1;
// ---
let a = -1;
```

```js
let a = { };
// ---
let a = { };
```

```js
let a = [ ];
// ---
let a = [ ];
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
const a = '12345678901234567890';
var a = '12345678901234567890';
using a = '12345678901234567890';
await using a = '12345678901234567890';
// ---
let a =
  '12345678901234567890';
const a =
  '12345678901234567890';
var a =
  '12345678901234567890';
using a =
  '12345678901234567890';
await using a =
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
