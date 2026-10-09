# R3 Keys

A key matches [a-zA-Z0-9_.-]+ and names one value across every loaded config. A
key belongs to the project whose config declares it as a counter, and a key no
config declares belongs to the first project loaded.

## Implementation

- [T1 Keys][T1]

[T1]: <tests/T1 Keys.md>

## Coverage

R3 is fully covered by T1. I read the tests each step names in
`src/config.test.js`, `src/store.test.js` and `src/server.test.js` and checked
what they assert.

R3 makes four statements:

1. **A key matches [a-zA-Z0-9_.-]+.** T1 covers this in two steps.
   - "isKey" accepts `disk.c_1-x`. It rejects a space, a slash, the empty string
     and a number.
   - "invalid key over HTTP" sends a PUT and a history request for `bad key`.
     Both are rejected with 400 and "invalid key".
2. **A key names one value across every loaded config.** This is the global key
   namespace. T1 covers it in the "one owner" step. Two configs both declare
   `shared`. Loading reports "key shared is already a counter of one", and only
   the first config's counter is kept: its scheduled command is `first`. So a
   key declared twice still has one owner and is not split per project.
3. **A key belongs to the project whose config declares it as a counter.** T1
   covers this in two steps.
   - "undeclared key" checks that `projectOf('b.key')` returns `b`, the second
     project, which declares that key.
   - "one owner" also checks that `projectOf('own')` returns `two`, the project
     that declares `own`.
4. **A key no config declares belongs to the first project loaded.** T1 covers
   this in two steps.
   - "undeclared key" checks that `projectOf('anything.else')` returns `a`, the
     first project, with the default policy.
   - "undeclared key stored" writes such a key, then reads it back from the
     first project's store, and finds it in `store.keys()`.

One maintenance note, which doesn't affect coverage: the Coverage section of R3
is out of date. It says nothing linked covers "names one value across every
loaded config" and suggests adding a T1 step. T1 now has that step, "one owner",
and it names the exact test the section suggests. The Coverage section and the
INCOMPLETE line under Status should be regenerated to match.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
