# T2 Sticky samples

Puts of an unchanged and a changed value, and history.

## Steps

### sticky put

- Type: javascript
- File: ../../../src/store.test.js
- Test: put is sticky in

### history

- Type: javascript
- File: ../../../src/store.test.js
- Test: is newest first, from since, at most limit

### never written

- Type: javascript
- File: ../../../src/store.test.js
- Test: get and history of a key never written are null and empty

### freshness by seen

- Type: javascript
- File: ../../../src/server.test.js
- Test: next judges freshness by seen: an unchanged report keeps the key waiting
  though its value is old

## Status

- Result: PASS - 4 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
