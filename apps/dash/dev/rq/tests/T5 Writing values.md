# T5 Writing values

Puts over HTTP and their aliases.

## Steps

### put

- Type: javascript
- File: ../../../src/server.test.js
- Test: PUT, POST and the deprecated set store the body as text, echo it, and
  say whether it changed

### invalid key

- Type: javascript
- File: ../../../src/server.test.js
- Test: a key outside the key pattern is rejected with 400

## Status

- Result: PASS - 2 steps
- Execution: [E3 all][E3]

[E3]: <../.rq/E3 all.md>
