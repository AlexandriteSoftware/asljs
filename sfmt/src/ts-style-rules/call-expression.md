# call-expression

## Tests

Simple expression does not change:

```js
test();
// ---
test();
```

Short single-parameter call does not require chopping:

```js
test(a);
// ---
test(a);
```

However, if it is already chopped, leave it as is:

```js
test(
  a);
// ---
test(
  a);
```

But check indentation of the chopped call:

```js
test(
a);
// ---
test(
  a);
```

And the closing parenthesis should be on the same line:

```js
test(
  a
);
// ---
test(
  a);
```

Two parameters require chopping:

```js
test(a, b);
// ---
test(
  a,
  b);
```

And nested indentation should be preserved:

```js
  test(a, b);
// ---
  test(
    a,
    b);
```

Short literal strings do not require chopping:

```js
test('ok');
// ---
test('ok');
```

Any short expression (see `expressionIsShort()`) does not require chopping:

```js
test(new Set());
// ---
test(new Set());
```

More complex expressions require chopping. Like long literal strings:

```js
test('12345678901234567890');
// ---
test(
  '12345678901234567890');
```

Long string template literals:

```js
test(`12345678901234567890`);
// ---
test(
  `12345678901234567890`);
```

Increments:

```js
test(a++);
// ---
test(
  a++);
```

Nested calls require chopping:

```js
test(test(test()));
// ---
test(
  test(
    test()));
```

This also:

```js
test(
  path.join(os.tmpdir(),
    'part-gitignore-'));
// ---
test(
  path.join(
    os.tmpdir(),
    'part-gitignore-'));
```

Definitely, async arrow function is a complex one (new line before
the parameter, the rest will be handled by other indentation rules):

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

Return statements:

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

Await statements:

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

And some other complex expressions:

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

```js
  const test = fn(a, b);
// ---
  const test = fn(
    a,
    b);
```

```js
  const test =
    fn(a, b);
// ---
  const test =
    fn(
      a,
      b);
```

```js
  const gitIgnoreContent =
    readFileSync(
    gitIgnorePath,
    'utf8');
// ---
  const gitIgnoreContent =
    readFileSync(
      gitIgnorePath,
      'utf8');
```
