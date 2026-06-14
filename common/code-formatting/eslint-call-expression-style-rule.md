# eslint-call-expression-style-rule

## Tests

```js
test();
// ---
test();
```

```js
test(a);
// ---
test(a);
```

```js
test(
  a);
// ---
test(
  a);
```

```js
test(a, b);
// ---
test(
  a,
  b);
```

```js
  test(a, b);
// ---
  test(
    a,
    b);
```

```js
test('test', async () => {
  await doSomething();
});
// ---
test(
  'test',
  async () => {
  await doSomething();
});
```

```js
function test() {
  return test(a, b);
}
// ---
function test() {
  return test(
    a,
    b);
}
```

```js
async function test() {
  await test(a, b);
}
// ---
async function test() {
  await test(
    a,
    b);
}
```

```js
test(another(a, b), another(c, d));
// ---
test(
  another(
    a,
    b),
  another(
    c,
    d));
```

```js
test({ data: 'Lorem ipsum...' });
// ---
test(
  { data: 'Lorem ipsum...' });
```

```js
test({ data: '12345678901234567890' });
// ---
test(
  { data: '12345678901234567890' });
```

```js
test({
    node
  });
// ---
test(
  {
    node
  });
```

```js
test.another(a, b);
// ---
test.another(
  a,
  b);
```

```js
test
  .another(a, b);
// ---
test
  .another(
    a,
    b);
```
