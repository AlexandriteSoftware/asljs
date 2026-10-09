# R5 Tests

Tests are a flat collection linked many-to-many: a requirement links to every
test that checks it, a test may check several requirements, and a test has no
`## Implementation` section. Links in a test are references, not edges.

## Implementation

- [T3 Tests][T3]

[T3]: <../tests/T3 Tests.md>

## Coverage

R5 is now fully covered. The gap described in its current `## Coverage` section
has been closed in the source. In "loadGraph makes no edges from the links of a
test" (`src/graph.test.ts:349`), R1 A now links to two tests, `T1 B.md` and `T2
D.md`, and the test asserts that it gets both as children. That test is already
one of T3's steps. T3 is R5's only link, so all coverage comes from its four
steps:

- **"Tests are a flat collection"**: the test nodes never get children.
  - "loadGraph makes no edges from the links of a test"
    (`src/graph.test.ts:349`) expects `'T1 B.md': [ ]` and `'T2 D.md': [ ]`.
    This holds even though `T1 B.md` has its own links and an `##
    Implementation` item.
  - "loadGraph takes every unlinked requirement of a folder as a root"
    (`src/graph.test.ts:226`) expects `'T1 C.md': [ ]`.
- **"A requirement links to every test that checks it"** (one requirement, many
  tests):
  - "loadGraph makes no edges from the links of a test" expects `'R1 A.md': [
    'T1 B.md', 'T2 D.md' ]` and no errors. This is the case the previous
    analysis reported as missing.
- **"A test may check several requirements"** (one test, many requirements):
  - "loadGraph takes every unlinked requirement of a folder as a root": R1 A and
    R2 B both have `T1 C.md` as a child, and there are no errors, so there is no
    "one parent" error.
  - The same step 349 shows it again: R1 A and R2 C share `T1 B.md`.
- **"A test has no `## Implementation` section"**: "execCheck reports problems
  of the graph and of each document" (`src/check.test.ts:40`) expects `T1
  Proof.md: a test has an Implementation section; only a requirement links to
  requirements and tests.` at `src/check.test.ts:116`.
- **"Links in a test are references, not edges"**:
  - "loadGraph makes no edges from the links of a test": the links in `T1
    B.md`'s body and in its `## Implementation` list create no edges. R2 C stays
    a root, and the roots are `[ 'R1 A.md', 'R2 C.md' ]`.
  - "loadGraph follows only Implementation links to requirements and tests"
    (`src/graph.test.ts:104`) adds that links outside `## Implementation` are
    not edges.

R5's `## Coverage` section and its `Coverage: INCOMPLETE` status are out of
date. Running `rq coverage` again will replace them. T3 checks the compiled
`build/graph.test.js`, so rebuild before running `rq test` so that step 349
includes the second test.

## Status

- Result: PASS
- Coverage: COMPLETE
