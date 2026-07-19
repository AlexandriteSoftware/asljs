# function-declaration

Chops `FunctionDeclaration` parameters into multiple lines and moves the closing
brace with a return type to a new line.

`FunctionDeclaration` structure:

- `id` : `Identifier` (the function name, e.g., `test`)
- `params` : `Node[]` (the function parameters, e.g., `param1`, `param2`)
- `body` : `BlockStatement` (the function body, e.g., `{ test(); }`)

## Tests

```js
function test() {
}
// ---
function test(
  )
{
}
```

```js
function test(
) {
}
// ---
function test(
  )
{
}
```

```js
function test(
    ) {
}
// ---
function test(
  )
{
}
```

```js
function test(
)
{
}
// ---
function test(
  )
{
}
```

```js
function test(
    )
{
}
// ---
function test(
  )
{
}
```

```js
function test(
  param1,
  param2)
{
}
// ---
function test(
    param1,
    param2
  )
{
}
```

```js
function test(
    param1,
  param2)
{
}
// ---
function test(
    param1,
    param2
  )
{
}
```

```js
function test(param1) {
}
// ---
function test(
    param1
  )
{
}
```

```js
function test(param1, param2) {
}
// ---
function test(
    param1,
    param2
  )
{
}
```

```js
function test(param1, param2) {
}
// ---
function test(
    param1,
    param2
  )
{
}
```

```js
function test(param1, param2 = null) {
}
// ---
function test(
    param1,
    param2 = null
  )
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
    param2 = null
  )
{
  console.log('test');
}
```

```js
async function test(param1, param2 = null) {
  console.log('test');
}
// ---
async function test(
    param1,
    param2 = null
  )
{
  console.log('test');
}
```

```js
async function test(param1, param2 = null) {
  console.log('test');

  return false;
}
// ---
async function test(
    param1,
    param2 = null
  )
{
  console.log('test');

  return false;
}
```

```ts
function test(value: unknown): FormatterDefinition {
  return value as FormatterDefinition;
}
// ---
function test(
    value: unknown
  ): FormatterDefinition
{
  return value as FormatterDefinition;
}
```

```ts
function test(value: unknown, fallback: FormatterDefinition): FormatterDefinition {
  return fallback;
}
// ---
function test(
    value: unknown,
    fallback: FormatterDefinition
  ): FormatterDefinition
{
  return fallback;
}
```

```ts
function isFormatterDefinition(value: unknown): value is FormatterDefinition {
  return typeof value === 'object';
}
// ---
function isFormatterDefinition(
    value: unknown
  ): value is FormatterDefinition
{
  return typeof value === 'object';
}
```

```ts
function isFormatterDefinition(
  value: unknown): value is FormatterDefinition
{
  return typeof value === 'object';
}
// ---
function isFormatterDefinition(
    value: unknown
  ): value is FormatterDefinition
{
  return typeof value === 'object';
}
```

```ts focus
function test<T>(value: T): T {
  return value;
}
// ---
function test<T>(
    value: T
  ): T
{
  return value;
}
```
