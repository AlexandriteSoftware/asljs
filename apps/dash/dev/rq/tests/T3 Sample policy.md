# T3 Sample policy

The policy syntax, and how each limit trims a key in both stores.

## Steps

### amounts

- Type: javascript
- File: ../../../src/samples.test.js
- Test: parseAmount reads a number, a case-insensitive suffix and products

### bad amounts

- Type: javascript
- File: ../../../src/samples.test.js
- Test: parseAmount rejects a bad number, an unknown unit and anything not above
  zero

### policy

- Type: javascript
- File: ../../../src/samples.test.js
- Test: parsePolicy reads the store, retention, count and quota

### default policy

- Type: javascript
- File: ../../../src/samples.test.js
- Test: parsePolicy defaults to a bounded database policy

### bad policy

- Type: javascript
- File: ../../../src/samples.test.js
- Test: parsePolicy rejects a policy that is not four fields, an unknown store,
  and a zero limit

### count

- Type: javascript
- File: ../../../src/store.test.js
- Test: keeps at most count samples and drops the oldest first

### retention

- Type: javascript
- File: ../../../src/store.test.js
- Test: expires a sample by when it was last seen, not when it first appeared

### quota

- Type: javascript
- File: ../../../src/store.test.js
- Test: keeps the values within the quota, but never evicts the newest

### sweep

- Type: javascript
- File: ../../../src/store.test.js
- Test: sweep ages out a key nobody writes, in both stores

### moved to memory

- Type: javascript
- File: ../../../src/store.test.js
- Test: sweep drops the database samples of a key whose policy moved to memory

### policy per counter

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reads a project, its counters and tabs, resolving db against the
  config folder

### project default

- Type: javascript
- File: ../../../src/config.test.js
- Test: a key no counter declares belongs to the first project, with its default
  policy

### on write and memory

- Type: javascript
- File: ../../../src/store.test.js
- Test: database limits apply on write, and memory samples never reach the
  database

## Status

- Result: PASS - 13 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
