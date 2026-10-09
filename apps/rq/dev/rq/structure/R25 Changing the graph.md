# R25 Changing the graph

`rq add`, `rq link`, `rq unlink`, `rq remove` and `rq move` create, link,
unlink, delete and move requirements and tests, rewriting the links to them.

## Implementation

- [T18 Changing the graph][T18]

[T18]: <../tests/T18 Changing the graph.md>

## Coverage

R25 makes a single statement: `rq add`, `rq link`, `rq unlink`, `rq remove` and
`rq move` create, link, unlink, delete and move requirements and tests, and
rewrite the links to them. T18 is the only node it links to. I checked each part
of that statement against T18's steps and the matching tests in
`src/change.test.ts`.

- **`rq add` creates requirements and tests:** covered by T18's steps "execAdd
  creates a requirement next to its parent and links it" and "execAdd creates a
  test with steps in the tests folder". The step "execAdd refuses a test parent,
  a bad name and an existing file" covers the cases it refuses. The last step
  also adds a test by parent id.
- **`rq link` links requirements and tests:** covered by "execLink links an
  existing node and refuses duplicates, cycles and a second parent". It links
  test T1 under R2, and links requirement R2 under R3 from a different working
  folder.
- **`rq unlink` unlinks:** covered by "execUnlink removes every link to the
  child", which removes the link to T2 and refuses a link that doesn't exist.
  The last step ("execUnlink takes ids, …") unlinks by id and by `.md` name and
  checks that the parent's status is recalculated.
- **`rq remove` deletes requirements and tests and the links to them:** covered
  by "execRemove deletes a leaf and the links to it". It removes test T1,
  removes the link to it from R1, and refuses a non-leaf without `--recursive`.
  The step "execRemove --recursive deletes what only removed documents link to"
  deletes requirements R1 and R3 and test T2. It keeps T2 while R3 still links
  to it, and keeps T1 but takes the link to R1 out of it.
- **`rq move` moves requirements and tests and rewrites the links:** covered by
  "execMove renames a document and rewrites the links to it". It moves
  requirement R2 to another folder and renames it, which rewrites the link in R1
  and the outgoing link in the moved file. It moves test T1, which rewrites its
  link back to R1. `rq check` passes afterwards, and the move refuses a bad name
  and a file that already exists. The last step also checks that a reference
  link's title changes to the new name.

One small gap: `rq unlink` is only tested with a test as the child, never a
requirement. The command uses the same code for both, so this doesn't leave the
statement uncovered. If you want it tested explicitly, add a step that unlinks
R2 from R1 and checks that R1's `## Implementation` no longer lists R2.

Every part of the statement is covered by at least one T18 step.

## Status

- Result: PASS
- Coverage: COMPLETE
