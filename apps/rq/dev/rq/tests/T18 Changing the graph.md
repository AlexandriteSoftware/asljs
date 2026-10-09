# T18 Changing the graph

The change commands keep links valid.

## Steps

### execAdd creates a requirement next to its parent and links it

- Type: javascript
- File: ../../../build/change.test.js
- Test: execAdd creates a requirement next to its parent and links it

### execAdd creates a test with steps in the tests folder

- Type: javascript
- File: ../../../build/change.test.js
- Test: execAdd creates a test with steps in the tests folder

### execAdd refuses a test parent, a bad name and an existing file

- Type: javascript
- File: ../../../build/change.test.js
- Test: execAdd refuses a test parent, a bad name and an existing file

### execLink links an existing node and refuses duplicates, cycles and a second parent

- Type: javascript
- File: ../../../build/change.test.js
- Test: execLink links an existing node and refuses duplicates, cycles and a
  second parent

### execUnlink removes every link to the child

- Type: javascript
- File: ../../../build/change.test.js
- Test: execUnlink removes every link to the child

### execRemove deletes a leaf and the links to it

- Type: javascript
- File: ../../../build/change.test.js
- Test: execRemove deletes a leaf and the links to it

### execRemove --recursive deletes what only removed documents link to

- Type: javascript
- File: ../../../build/change.test.js
- Test: execRemove --recursive deletes what only removed documents link to

### execMove renames a document and rewrites the links to it

- Type: javascript
- File: ../../../build/change.test.js
- Test: execMove renames a document and rewrites the links to it

### execUnlink takes ids, execMove retitles reference links, and both refresh statuses

- Type: javascript
- File: ../../../build/change.test.js
- Test: execUnlink takes ids, execMove retitles reference links, and both
  refresh statuses

## Status

- Result: PASS - 9 steps
- Execution: [E16 rq][E16]

[E16]: <../.rq/E16 rq.md>
