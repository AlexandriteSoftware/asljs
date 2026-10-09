# R4 Sticky samples

Values are sticky: a put whose value equals the key's newest sample adds no
sample and only moves that sample's seen to now; a changed value adds a sample
whose ts and seen are now. A key's current value is its newest sample, its
history is the list of changes, newest first, and it is fresh by its seen, not
its ts.

## Implementation

- [T2 Sticky samples][T2]

[T2]: <tests/T2 Sticky samples.md>

## Coverage

R4 is fully covered by T2. I checked all four T2 steps against the tests they
name in `src/store.test.js` and `src/server.test.js`. All four tests exist. The
coverage note inside R4 is out of date: it says the freshness clause is not
covered, but T2 now has a "freshness by seen" step that covers it.

- **An unchanged put adds no sample and only moves seen to now.** T2's "sticky
  put" step covers this, for both the database and memory stores. It puts `41`
  at 1000 and `41` again at 2000. The second put returns changed false, ts 1000,
  seen 2000. History then holds one row for `41` with ts 1000 and seen 2000.
- **A changed put adds a sample whose ts and seen are now.** Also "sticky put":
  putting `42` at 3000 returns changed true, ts 3000, seen 3000. History gains a
  new row with those values.
- **The current value is the newest sample.** Also "sticky put": `get` at 3000
  returns `{ ts: 3000, seen: 3000, value: '42' }`, which is the newest of the
  two samples. "never written" adds the edge case: a key with no puts has a null
  current value.
- **History is the list of changes, newest first.** "sticky put" shows history
  holds only the two changes, `42` then `41`, with the repeated `41` folded into
  one row. The "history" step shows five changing puts listed newest first.
  "never written" shows that a key with no puts has an empty history.
- **A key is fresh by its seen, not its ts.** T2's "freshness by seen" step
  covers this. The test puts `steady` at 12:00:10, and `/api/next` reads `stale`
  at 12:01:30. Then the same value is put again. `/api/meta` still shows ts
  12:00:10, and `/api/next` now reads `wait` with 30000 ms left. A freshness
  check based on ts would still read `stale`, so this test tells the two apart.

To maintain: R4's Coverage section says "Not fully covered" and its Status says
"Coverage: INCOMPLETE". Update both to match the current T2, for example on the
next `rq coverage .` run.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
