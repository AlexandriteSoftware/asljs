# T28 Markdown post-processing

The configured command gets the written files.

## Steps

### findConfig reads the nearest rq.json of the folder or a parent

- Type: javascript
- File: ../../../../../libs/mdcli/build/post-process.test.js
- Test: findConfig reads the nearest rq.json of the folder or a parent

### postProcess runs the command with the written files that still exist

- Type: javascript
- File: ../../../../../libs/mdcli/build/post-process.test.js
- Test: postProcess runs the command with the written files that still exist

### rq post-processes the markdown files a command wrote

- Type: javascript
- File: ../../../build/cli.test.js
- Test: rq post-processes the markdown files a command wrote

## Status

- Result: PASS - 3 steps
- Execution: [E16 rq][E16]

[E16]: <../.rq/E16 rq.md>
