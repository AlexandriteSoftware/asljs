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

```ts
({
   test
 });
// ---
({ test });
```

```ts
({
   test(
     )
   {

   }
 });
// ---
({ test(
     )
   {

   } });
```

```ts
({
   async test(
     )
   {

   },
   *test2(
     )
   {

   },
   async [key](
     )
   {

   }
 });
// ---
({ async test(
     )
   {

   },
   *test2(
     )
   {

   },
   async [key](
     )
   {

   } });
```

```ts
({ ...items, [this.key]: value });
// ---
({ ...items,
   [this.key]: value });
```

```ts
({
  get test() {
  },
  set test2(value) {
  }
});
// ---
({ get test() {
  },
   set test2(value) {
  } });
```

Parentheses around a value are kept, so a sequence stays one value:

```ts
({ test: (a, b), test2: c });
// ---
({ test: (a, b),
   test2: c });
```
