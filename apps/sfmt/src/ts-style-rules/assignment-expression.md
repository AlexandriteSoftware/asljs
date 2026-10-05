# assignment-expression

## Tests

```js
a = 1;
// ---
a = 1;
```

```js
a = -1;
// ---
a = -1;
```

```js
a = { };
// ---
a = { };
```

```js
a = [ ];
// ---
a = [ ];
```

```js
a =
  test;
// ---
a =
  test;
```

```js
a = '12345678901234567890';
// ---
a =
  '12345678901234567890';
```

```js
a = `
12345678901234567890`;
// ---
a =
  `
12345678901234567890`;
```

```js
a = fn(a, b);
// ---
a =
  fn(a, b);
```

Parentheses around the left side are kept. Without them a cast on the left would
not parse:

```ts
(element[name] as unknown) = fn(a, b);
// ---
(element[name] as unknown) =
  fn(a, b);
```

Parentheses around the right side are kept too:

```js
a = (fn(a, b));
// ---
a =
  (fn(a, b));
```
