# criteria-expression

## Tests

```ts
nodeLocation === undefined
// ---
nodeLocation === undefined
```

```ts
a + b === c
// ---
a + b === c
```

```ts
a === b && c
// ---
a === b
&& c
```

```ts
a && b && c
// ---
a
&& b
&& c
```

```ts
a12345.b123.c12 === c
// ---
a12345.b123.c12
=== c
```
