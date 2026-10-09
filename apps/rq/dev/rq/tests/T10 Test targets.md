# T10 Test targets

Targets select the tests to run.

## Steps

### execTest takes several paths, names and ids, and runs each test once

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest takes several paths, names and ids, and runs each test once

### execTest of a requirement runs its own tests, and with recurse everything below it

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest of a requirement runs its own tests, and with recurse
  everything below it

### execTest takes a requirement or test file by its path

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest takes a requirement or test file by its path

### selectTargets selects a target, its direct tests, or everything below it

- Type: javascript
- File: ../../../build/targets.test.js
- Test: selectTargets selects a target, its direct tests, or everything below it

## Status

- Result: PASS - 4 steps
- Execution: [E10 T8 T10 T12 T27][E10]

[E10]: <../.rq/E10 T8 T10 T12 T27.md>
