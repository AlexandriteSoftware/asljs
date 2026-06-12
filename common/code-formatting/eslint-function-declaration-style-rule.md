# eslint-function-declaration-style-rule

## Tests

```js
function test() { }
// ---
function test()
{
}
```

```js
function test(param1) { }
// ---
function test(
  param1)
{
}
```

```js
function test(param1, param2) { }
// ---
function test(
  param1,
  param2)
{
}
```

```js
function test(param1, param2) { }
// ---
function test(
  param1,
  param2)
{
}
```

```js
function test(param1, param2 = null) { }
// ---
function test(
  param1,
  param2 = null)
{
}
```

```js
function test(param1, param2 = null) {
  console.log('test');
}
// ---
function test(
  param1,
  param2 = null)
{
  console.log('test');
}
```

