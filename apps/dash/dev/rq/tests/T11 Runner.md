# T11 Runner

Running counters and putting their output.

## Steps

### once

- Type: javascript
- File: ../../../src/runner.test.js
- Test: once runs every counter and puts its stdout, trimmed at the end, to its
  key

### failure

- Type: javascript
- File: ../../../src/runner.test.js
- Test: a counter that exits non-zero records no sample, and the runner logs its
  exit code

### sticky

- Type: javascript
- File: ../../../src/runner.test.js
- Test: an unchanged output is logged as sticky

### start

- Type: javascript
- File: ../../../src/runner.test.js
- Test: on start the runner runs the counters due now and those marked startup,
  then each minute those due

### timeout

- Type: javascript
- File: ../../../src/runner.test.js
- Test: a counter that outruns DASH_TIMEOUT is killed and records no sample

### runner as a program

- Type: javascript
- File: ../../../src/runner.test.js
- Test: runner.js as a program loads its configs and puts to localhost on PORT,
  or to DASH_URL

### with the server

- Type: javascript
- File: ../../../src/server.test.js
- Test: server.js as a program opens every configured database at startup

## Status

- Result: PASS - 7 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
