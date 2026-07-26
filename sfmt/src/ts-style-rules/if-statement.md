# if-statement

## Tests

```ts
if (ok) {
  return true;
}
// ---
if (ok) {
  return true;
}
```

```ts
if (nodeLocation === undefined || nodeLocation === null) {
  return '';
}
// ---
if (
  nodeLocation === undefined
  || nodeLocation === null
) {
  return '';
}
```

```ts
if (ok) {
  record(
    value);
} else if (nodeLocation === undefined || nodeLocation === null) {
  return '';
}
// ---
if (ok) {
  record(
    value);
} else if (
  nodeLocation === undefined
  || nodeLocation === null
) {
  return '';
}
```
