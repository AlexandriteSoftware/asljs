# R3 Node kinds

A file named `R<n> <name>.md` is a requirement, `T<n> <name>.md` a test; any
other document is not part of the graph. An id belongs to one document of a
folder: a duplicate is a structure error.

## Implementation

- [T1 Node kinds][T1]
- [T29 Ids and cycles][T29]

[T1]: <../tests/T1 Node kinds.md>
[T29]: <../tests/T29 Ids and cycles.md>

## Coverage

Every statement in R3 is covered by one of its two linked tests. Both tests are
`javascript` steps, and I checked the cases they run in `src/graph.test.ts`.

- **"A file named `R<n> <name>.md` is a requirement, `T<n> <name>.md` a test"**:
  T1 Node kinds covers this. Its step "getNodeKind reads the kind from the file
  name" checks that `R12 Export.md` is a `requirement` and `T3.md` is a `test`
  (`src/graph.test.ts:324`).
- **"any other document is not part of the graph"**: T1 Node kinds also covers
  this. The same step checks that `getNodeKind` returns `null` for `notes.md`,
  `R Export.md`, `rq1 export.md`, `R1Export.md` and `R1 Export.txt`. That covers
  a plain name, a prefix with no number, the wrong case, a missing space and the
  wrong extension.
  - The test only shows this at the `getNodeKind` level. Nothing checks that
    `loadGraph` leaves out a non-node document that a requirement links to.
  - An optional improvement: add a case to a `loadGraph` test where a
    requirement's `## Implementation` links to `notes.md`, and check that
    `notes.md` produces no node or edge. This makes the statement stronger but
    is not needed for coverage.
- **"An id belongs to one document of a folder: a duplicate is a structure
  error"**: T29 Ids and cycles covers this. Its step "loadGraph reports
  duplicate ids, and the cycles of a folder without a root"
  (`src/graph.test.ts:397`) puts `a/T1 A.md` and `b/T1 B.md` in one folder. It
  checks that `loadGraph` reports `T1: several documents have this id: a/T1
  A.md, b/T1 B.md; ids must be unique.` That also shows uniqueness applies
  across the whole folder, subfolders included.

The requirement is fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
