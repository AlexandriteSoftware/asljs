# variable-declaration

## Tests

```ts
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

```ts
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

```ts
let a = -1;
// ---
let a = -1;
```

```ts
let a = { };
// ---
let a = { };
```

```ts
let a = [ ];
// ---
let a = [ ];
```

```ts
let a =
  test;
// ---
let a =
  test;
```

```ts
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

```ts
let a = `
12345678901234567890`;
// ---
let a =
  `
12345678901234567890`;
```

```ts
let a = fn(a, b);
// ---
let a =
  fn(a, b);
```

```ts
const line = sourceCode.lines[nodeStartLine - 1];
// ---
const line =
  sourceCode.lines[nodeStartLine - 1];
```
