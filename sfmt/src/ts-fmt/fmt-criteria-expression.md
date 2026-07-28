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
a + b
=== c
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
a12345.b12345.c1234 === c
// ---
a12345.b12345.c1234 === c
```

```ts
a12345.b12345.c12345 === a12345.b12345.c12345
// ---
a12345.b12345.c12345
=== a12345.b12345.c12345
```
