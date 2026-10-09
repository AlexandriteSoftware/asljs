# T26 Retention

Old execution files are removed beyond the limits.

## Steps

### pruneExecutions removes the oldest files beyond the limits, keeping the latest results

- Type: javascript
- File: ../../../build/results.test.js
- Test: pruneExecutions removes the oldest files beyond the limits, keeping the
  latest results

### pruneExecutions keeps 300 files and 50 MB by default, and removes by size

- Type: javascript
- File: ../../../build/results.test.js
- Test: pruneExecutions keeps 300 files and 50 MB by default, and removes by
  size

### pruneExecutions does not keep the results of tests that no longer exist

- Type: javascript
- File: ../../../build/results.test.js
- Test: pruneExecutions does not keep the results of tests that no longer exist

### execTest and execLog remove the oldest execution files beyond the retention

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest and execLog remove the oldest execution files beyond the
  retention

## Status

- Result: PASS - 4 steps
- Execution: [E16 rq][E16]

[E16]: <../.rq/E16 rq.md>
