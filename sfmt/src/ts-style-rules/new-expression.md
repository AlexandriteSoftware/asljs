# new-expression

## Tests

Simple expression does not change:

```js
new Test();
// ---
new Test();
```

Short single-parameter call does not require chopping:

```js
new Test(a);
// ---
new Test(a);
```

However, if it is already chopped, leave it as is:

```js
new Test(
  a);
// ---
new Test(
  a);
```

But check indentation of the chopped call:

```js
new Test(
a);
// ---
new Test(
  a);
```

And the closing parenthesis should be on the same line:

```js
new Test(
  a
);
// ---
new Test(
  a);
```

Two parameters require chopping:

```js
new Test(a, b);
// ---
new Test(
  a,
  b);
```

And nested indentation should be preserved:

```js
  new Test(a, b);
// ---
  new Test(
    a,
    b);
```

Short literal strings do not require chopping:

```js
new Test('ok');
// ---
new Test('ok');
```

Any short expression (see `expressionIsShort()`) does not require chopping:

```js
new Test(new Set());
// ---
new Test(new Set());
```

More complex expressions require chopping. Like long literal strings:

```js
new Test('12345678901234567890');
// ---
new Test(
  '12345678901234567890');
```

Long string template literals:

```js
new Test(`12345678901234567890`);
// ---
new Test(
  `12345678901234567890`);
```

Increments:

```js
new Test(a++);
// ---
new Test(
  a++);
```

Nested calls require chopping:

```js
new Test(new Test(new Test()));
// ---
new Test(
  new Test(
    new Test()));
```

Definitely, async arrow function is a complex one (new line before
the parameter, the rest will be handled by other indentation rules):

```js
new Test('test', async () => {
  await doSomething();
});
// ---
new Test(
  'test',
  async () => {
  await doSomething();
});
```

Return statements:

```js
function test() {
  return new Test(a, b);
}
// ---
function test() {
  return new Test(
    a,
    b);
}
```

Await statements:

```js
async function test() {
  await new Test(a, b);
}
// ---
async function test() {
  await new Test(
    a,
    b);
}
```

And some other complex expressions:

```js
new Test({ data: 'Lorem ipsum...' });
// ---
new Test(
  { data: 'Lorem ipsum...' });
```

```js
new Test({ data: '12345678901234567890' });
// ---
new Test(
  { data: '12345678901234567890' });
```

```js
new Test({
    node
  });
// ---
new Test(
  {
    node
  });
```

```js
  const test =
    new Test(a, b);
// ---
  const test =
    new Test(
      a,
      b);
```

```js
  const gitIgnoreContent =
    new Test(
    gitIgnorePath,
    'utf8');
// ---
  const gitIgnoreContent =
    new Test(
      gitIgnorePath,
      'utf8');
```
