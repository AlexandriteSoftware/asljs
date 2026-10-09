# T6 Reading values

Get, meta, history and keys over HTTP.

## Steps

### get

- Type: javascript
- File: ../../../src/server.test.js
- Test: get answers one key as text and several as JSON, with empty and null for
  keys never written

### meta and history

- Type: javascript
- File: ../../../src/server.test.js
- Test: meta answers the keys with their ts and seen, and history the samples
  newest first

### keys

- Type: javascript
- File: ../../../src/server.test.js
- Test: keys lists the stored keys, and dashboards the projects, tabs and errors
  without paths or commands

### history limits

- Type: javascript
- File: ../../../src/server.test.js
- Test: history answers 500 samples by default and at most 5000

### keys of every store

- Type: javascript
- File: ../../../src/store.test.js
- Test: keys lists the keys of every configured database and of memory

### keys of every project

- Type: javascript
- File: ../../../src/store.test.js
- Test: a key is stored in the database of the project whose config declares it

## Status

- Result: PASS - 6 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
