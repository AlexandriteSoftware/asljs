# Results and status

How results are recorded, kept and turned into statuses.

- The `## Status` sections are the source of truth for statuses (`getStatuses`):
  a test has the result it ran with now or its recorded `Result`; a requirement
  in the `recalculate` set, or one recording no result, is derived from its
  links - `FAIL` wins over `NOT RUN`, and a node met again on the current path
  is a cycle and fails - and any other requirement keeps its recorded `Result`.
  Execution files are only the history; `.rq` is read for retention, never for
  statuses.
- After `rq test` and `rq log`, `writeStatuses` writes the tests that ran, with
  their `Execution` link, and recalculates the changed documents and
  `withAncestors` of them, rewriting `Result` only where it changed. A document
  never run and without a section is left alone, so a first run does not touch
  every file. `Coverage` is written only by `rq coverage` and kept by everything
  else.
- `rq test` without `--recurse` recalculates only what it reports; each
  sub-requirement of a target keeps its recorded status and is printed as
  `(recorded)`, so it is clear which statuses the run did not produce.
- `writeExecution` reserves a number by creating `.rq/E<n>.lock` exclusively,
  and takes it only when no execution has it, so concurrent runs never share a
  number; the lock is removed once the file is written.
- `loadLatestResults`, which retention uses, orders a test's results by the
  execution's `Date`, then by number, so files merged from another branch keep
  the right file protected.
- `writeStatus` rewrites only the items `rq` owns and the definition of its
  execution link; other items, paragraphs and definitions in the section are
  carried over verbatim (`keepForeign`).
- Structural commands call `writeStatuses` with `existingOnly`, so a change
  updates the results it made stale without adding sections everywhere.
- `pruneExecutions` applies the retention - 300 files, 50 MB (`RETENTION`) -
  after `rq test` and `rq log`, oldest first. It skips a file that is some
  test's latest result, for tests whose document still exists in the working
  folder, so the limits can be exceeded when every remaining file is one; the
  newest is always kept.
- The changed files come from `git status --porcelain -- .`, run in the working
  folder, so they are those of the working folder; outside a repository the
  commit and branch are `none`. Tests replace it with `Io.workingTree`.
