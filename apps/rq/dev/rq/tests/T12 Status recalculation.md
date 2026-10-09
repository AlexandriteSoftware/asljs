# T12 Status recalculation

Statuses follow the latest results and propagate up.

## Steps

### getStatuses passes a requirement only when everything below it passes

- Type: javascript
- File: ../../../build/status.test.js
- Test: getStatuses passes a requirement only when everything below it passes

### getStatuses fails a requirement with no links and one in a cycle

- Type: javascript
- File: ../../../build/status.test.js
- Test: getStatuses fails a requirement with no links and one in a cycle

### getStatuses takes the recorded results, and recalculates only what it is asked to

- Type: javascript
- File: ../../../build/status.test.js
- Test: getStatuses takes the recorded results, and recalculates only what it is
  asked to

### execTest writes the status of each test and of the requirements above it

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest writes the status of each test and of the requirements above it

### execTest merges the tests it ran with the recorded statuses, without reading .rq

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest merges the tests it ran with the recorded statuses, without
  reading .rq

### execUnlink takes ids, execMove retitles reference links, and both refresh statuses

- Type: javascript
- File: ../../../build/change.test.js
- Test: execUnlink takes ids, execMove retitles reference links, and both
  refresh statuses

### execAdd, execLink, execRemove and execMove refresh the statuses they make stale

- Type: javascript
- File: ../../../build/change.test.js
- Test: execAdd, execLink, execRemove and execMove refresh the statuses they
  make stale

## Status

- Result: PASS - 7 steps
- Execution: [E10 T8 T10 T12 T27][E10]

[E10]: <../.rq/E10 T8 T10 T12 T27.md>
