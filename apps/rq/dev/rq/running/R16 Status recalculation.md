# R16 Status recalculation

Statuses are read from the documents' `## Status` sections, never from `.rq`.
After a run, each test that ran gets its result, and the targets and every
requirement above them are recalculated from what they link to and written;
every other requirement keeps its recorded result. A failed test fails every
requirement above it; a requirement passes only when everything below it passes.
The structural commands update the results they make stale.

## Implementation

- [T12 Status recalculation][T12]

[T12]: <../tests/T12 Status recalculation.md>

## Coverage

I've read R16, T12 and the two `change.test.ts` cases T12 runs, so I'm writing
up the verdict now.

R16 is fully covered by T12. The `## Coverage` section in R16 is out of date:
since it was written, T12 gained the step "execAdd, execLink, execRemove and
execMove refresh the statuses they make stale", which closes the gap it
reported.

- **"Statuses are read from the documents' `## Status` sections, never from
  `.rq`."** The step "execTest merges the tests it ran with the recorded
  statuses, without reading .rq" covers this. A stale `.rq` execution is ignored
  and the recorded `## Status` is used. "getStatuses takes the recorded results,
  and recalculates only what it is asked to" also covers it.
- **"After a run, each test that ran gets its result."** The step "execTest
  writes the status of each test and of the requirements above it" covers this.
- **"…the targets and every requirement above them are recalculated from what
  they link to and written."** The same execTest step covers this, and so does
  the `withAncestors` / `recalculate` check in "getStatuses takes the recorded
  results…".
- **"Every other requirement keeps its recorded result."** "execTest merges the
  tests it ran…" covers this: a sub-requirement is reported `(recorded)` and is
  not rewritten. The `recalculate` case in "getStatuses takes the recorded
  results…" also covers it.
- **"A failed test fails every requirement above it; a requirement passes only
  when everything below it passes."** "getStatuses passes a requirement only
  when everything below it passes" covers this. The edge cases are covered by
  "getStatuses fails a requirement with no links and one in a cycle".
- **"The structural commands update the results they make stale."** Two
  `change.test.ts` steps cover this:
  - "execUnlink takes ids, execMove retitles reference links, and both refresh
    statuses" covers `unlink`. R2 becomes `FAIL - links to no requirement or
    test`.
  - The new step "execAdd, execLink, execRemove and execMove refresh the
    statuses they make stale" covers the other commands:
    - **`add`:** R2 goes from a recorded `PASS` to `NOT RUN - 2 of 2 links not
      run`.
    - **`remove`:** R2 is recalculated to `NOT RUN - 1 of 1 links not run`.
    - **`link`:** the output must show `Updated reqs/R1 Root.md`, separate from
      the `Linked …` line. That line is the status rewrite.
    - **`move`:** it runs and the result is checked. Moving a file doesn't
      change the graph, so it makes no status stale.

One weakness, not a gap: after `execLink`, the test checks that R1's status was
rewritten but not its value. One extra assertion would make it explicit: after
linking R3 (which links T2) under a `PASS` R1, R1's `## Status` is no longer `-
Result: PASS`. The next `rq coverage` run should also replace the stale analysis
in R16's `## Coverage`.

## Status

- Result: PASS
- Coverage: COMPLETE
