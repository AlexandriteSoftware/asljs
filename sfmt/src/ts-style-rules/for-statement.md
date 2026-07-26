# for-statement

## Tests

```ts
for (
  let index = 0;
  index < items.length;
  index++
) {
  record(
    items[index]);
}
// ---
for (
  let index = 0;
  index < items.length;
  index++
) {
  record(
    items[index]);
}
```

```ts
for (let index = 0; index < items.length; index++) {
  record(
    items[index]);
}
// ---
for (
  let index = 0;
  index < items.length;
  index++
) {
  record(
    items[index]);
}
```

```ts
for (; index < items.length; index++) {
  record(
    items[index]);
}
// ---
for (
  ;
  index < items.length;
  index++
) {
  record(
    items[index]);
}
```
