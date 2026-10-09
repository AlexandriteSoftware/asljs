# T25 Test report

rq test reports each node and the structure errors.

## Steps

### execTest of a folder runs every test, records them, and reports the latest status

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest of a folder runs every test, records them, and reports the
  latest status

### execTest reports structure errors and requirements with no links

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest reports structure errors and requirements with no links

### execTest and execLog remove the oldest execution files beyond the retention

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest and execLog remove the oldest execution files beyond the
  retention

### execTest of a requirement runs its own tests, and with recurse everything below it

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest of a requirement runs its own tests, and with recurse
  everything below it

### execTest merges the tests it ran with the recorded statuses, without reading .rq

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest merges the tests it ran with the recorded statuses, without
  reading .rq

### execTest exits with 1 on a structure error even when every node passes

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest exits with 1 on a structure error even when every node passes

### rq test returns the verification exit code

- Type: javascript
- File: ../../../build/cli.test.js
- Test: rq test returns the verification exit code

## Status

- Result: PASS - 7 steps
- Execution: [E16 rq][E16]

[E16]: <../.rq/E16 rq.md>
