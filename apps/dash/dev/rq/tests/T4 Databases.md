# T4 Databases

Where a project's database is, and that a shared file is opened once.

## Steps

### db path

- Type: javascript
- File: ../../../src/config.test.js
- Test: load reads a project, its counters and tabs, resolving db against the
  config folder

### db default

- Type: javascript
- File: ../../../src/config.test.js
- Test: db defaults to DASH_DB, then to dash.sqlite beside the config

### shared file

- Type: javascript
- File: ../../../src/store.test.js
- Test: openAll opens each database once, even when two projects name the same
  file

### keys of every database

- Type: javascript
- File: ../../../src/store.test.js
- Test: keys lists the keys of every configured database and of memory

### close

- Type: javascript
- File: ../../../src/store.test.js
- Test: close closes every database, and the next use opens it again

### database of the project

- Type: javascript
- File: ../../../src/store.test.js
- Test: a key is stored in the database of the project whose config declares it

### server as a program

- Type: javascript
- File: ../../../src/server.test.js
- Test: server.js as a program opens every configured database at startup

## Status

- Result: PASS - 7 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
