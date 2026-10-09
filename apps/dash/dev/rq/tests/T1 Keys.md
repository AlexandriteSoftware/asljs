# T1 Keys

Which keys are valid, and which project a key belongs to.

## Steps

### isKey

- Type: javascript
- File: ../../../src/config.test.js
- Test: isKey accepts letters, digits, dot, dash and underscore only

### undeclared key

- Type: javascript
- File: ../../../src/config.test.js
- Test: a key no counter declares belongs to the first project, with its default
  policy

### undeclared key stored

- Type: javascript
- File: ../../../src/store.test.js
- Test: a key no counter declares is stored in the first project with the
  project policy

### invalid key over HTTP

- Type: javascript
- File: ../../../src/server.test.js
- Test: a key outside the key pattern is rejected with 400

### one owner

- Type: javascript
- File: ../../../src/config.test.js
- Test: a project, a key or a tab claimed twice is reported, and the first
  config keeps it

## Status

- Result: PASS - 5 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
