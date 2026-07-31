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

Comparison with numbers that are less than 3 characters long (e.g., 1, 12, -10)
are not split even if the another side is long:

```ts
a12345.b12345.c12345 === 12
// ---
a12345.b12345.c12345 === 12
```

```ts
a12345.b12345.c12345 !== 0
// ---
a12345.b12345.c12345 !== 0
```

```ts
a12345.b12345.c12345 > -1
// ---
a12345.b12345.c12345 > -1
```

```ts
a12345.b12345.c12345 <= 0
// ---
a12345.b12345.c12345 <= 0
```
