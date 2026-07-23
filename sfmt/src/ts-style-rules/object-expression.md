# object-expression

## Tests

```ts
({ test: [ ] });
// ---
({ test: [ ] });
```

```ts
({
  test: 1
});
// ---
({ test: 1 });
```

```ts
({
  test: 1,
  test2: 2
});
// ---
({ test: 1,
   test2: 2 });
```

```ts
({
  test: '01234567890123456789'
});
// ---
({ test:
     '01234567890123456789' });
```

```ts focus
({ test });
// ---
({ test });
```
