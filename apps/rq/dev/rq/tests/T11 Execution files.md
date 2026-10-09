# T11 Execution files

Runs are recorded with the working directory state.

## Steps

### formatExecution writes the run, the working directory and each test

- Type: javascript
- File: ../../../build/results.test.js
- Test: formatExecution writes the run, the working directory and each test

### writeExecution numbers the files and loadResults keeps the latest result of each test

- Type: javascript
- File: ../../../build/results.test.js
- Test: writeExecution numbers the files and loadResults keeps the latest result
  of each test

### parseExecution reads the result of each test section

- Type: javascript
- File: ../../../build/results.test.js
- Test: parseExecution reads the result of each test section

### readWorkingTree reads the commit, the branch and the changed files

- Type: javascript
- File: ../../../build/results.test.js
- Test: readWorkingTree reads the commit, the branch and the changed files

### loadResults prefers a later date, and writeExecution never reuses a number

- Type: javascript
- File: ../../../build/results.test.js
- Test: loadResults prefers a later date, and writeExecution never reuses a
  number

### execTest of a folder runs every test, records them, and reports the latest status

- Type: javascript
- File: ../../../build/test.test.js
- Test: execTest of a folder runs every test, records them, and reports the
  latest status

## Status

- Result: PASS - 6 steps
- Execution: [E9 rq][E9]

[E9]: <../.rq/E9 rq.md>
