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
if (nodeLocation === undefined) {
  return '';
}
// ---
if (nodeLocation === undefined) {
  return '';
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
if (a + b === c) {
  return true;
}
// ---
if (
  a + b
  === c
) {
  return true;
}
```

```ts
if (a === b && c) {
  return true;
}
// ---
if (
  a === b
  && c
) {
  return true;
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
