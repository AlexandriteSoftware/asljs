# R17 Manual results

`rq log` records a result established another way as an execution file with one
test, and recalculates the statuses.

## Implementation

- [T13 Manual results][T13]

[T13]: <../tests/T13 Manual results.md>

## Coverage

R17 is fully covered by its one linked test, T13. One assertion in it is weaker
than it could be (see the end).

T13 runs a single step, the `execLog records a result of a test only, in an
execution file` test in `apps/rq/src/change.test.ts:434`. R17 makes three
claims, and that test covers each:

- **`rq log` records a result established another way.** The test calls
  `execLog` on `reqs/tests/T2 Fails.md` twice. The first call gives `PASS` with
  a note ("checked by hand"); the second gives `FAIL` with an explicit time and
  command. It checks that each call prints `Logged reqs/tests/T2 Fails.md: …`.
  It also checks that `.rq/E2 T2 Fails.md` ends with `- Result: PASS - checked
  by hand`. Finally, it checks that `execLog` refuses a requirement (`is a
  requirement; only a test has a result`), an invalid status, and an invalid
  time.
- **…as an execution file with one test.** The test compares `.rq/E3 T2
  Fails.md` against its full expected text. That file has the header (Date,
  Command, `Result: FAIL - 0 of 1 tests passed`, Commit, Branch, Changed files)
  and a single `## T2 Fails` section with its file and result. That shows the
  file holds exactly one test.
- **…and recalculates the statuses.** After each call, the expected output lists
  `Updated reqs/R1 Root.md`, `Updated reqs/R2 Part.md` and `Updated
  reqs/tests/T2 Fails.md`. So the logged test and every requirement above it get
  their statuses rewritten. The test also checks that the test document keeps
  its original content (`startsWith(before)`), so only the status changes.

The weak point is the third claim. The test checks which files are rewritten,
not what they say. It does not check that `R1 Root` and `R2 Part` end up as FAIL
after the `FAIL` log. How statuses are calculated is not part of R17's
statement, so this is not a coverage gap. To tighten it, read `reqs/R1 Root.md`
and `reqs/tests/T2 Fails.md` after the second call and assert their `## Status`
lines show `FAIL`.

Verdict: every statement is covered.

## Status

- Result: PASS
- Coverage: COMPLETE
