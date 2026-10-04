# array-expression

## Tests

```ts
[]
// ---
[ ]
```

```ts
[ ]
// ---
[ ]
```

```ts
[
  test1
]
// ---
[ test1 ]
```

```ts
[
  test1, test2
]
// ---
[ test1,
  test2 ]
```

An array with a hole is left as written: the formatter does not rebuild one, so
the layout is not checked either.

```ts
[1, , 3]
// ---
[1, , 3]
```
