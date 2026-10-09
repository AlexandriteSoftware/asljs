# R4 Requirement hierarchy

Requirements form a strict hierarchy: no cycles, and every requirement but a
root has exactly one parent. A second parent and a cycle are structure errors,
reported even in a folder without a root, and `rq link` refuses both.

## Implementation

- [T2 Requirement hierarchy][T2]
- [T29 Ids and cycles][T29]

[T2]: <../tests/T2 Requirement hierarchy.md>
[T29]: <../tests/T29 Ids and cycles.md>

## Coverage

R4 is fully covered. It makes four statements, and each one is checked by at
least one step in T2 or T29.

- **No cycles, and a cycle is a structure error.** T2, step "loadGraph reports
  broken links, cycles and unreachable documents" (`src/graph.test.ts`). It
  builds R2 → R3 → R2 and expects the error `cycle: R2 B.md -> R3 C.md -> R2
  B.md.`. It checks this when loading from a file and when loading from a
  folder.
- **Every requirement except a root has exactly one parent, and a second parent
  is a structure error.** T2, step "loadGraph reports a requirement linked from
  several requirements". R1 and R2 both link to R3, and the test expects `R3
  C.md: linked from 2 requirements, R1 A.md, R2 B.md; a requirement has one
  parent.`. The cycle step above also expects this error, for R2. The "at most
  one parent" part needs no separate check: a requirement with no parent is a
  root by definition.
- **Both errors are reported even in a folder without a root.** T29, step
  "loadGraph reports duplicate ids, and the cycles of a folder without a root".
  It builds R1 ↔ R2 ↔ R3, which leaves no root. It expects an empty `roots` list
  and the errors "no requirement is a root", both cycles, and `R2 B.md: linked
  from 2 requirements …`. That covers the cycle error and the second-parent
  error in a folder with no root.
- **`rq link` refuses both.** T2, step "execLink links an existing node and
  refuses duplicates, cycles and a second parent" (`src/change.test.ts`). It
  expects `the link would make a cycle` both for R2 → R1 and for a self-link R1
  → R1. It expects `… is already linked from reqs/R1 Root.md; a requirement has
  one parent` when R3 tries to link R2, and the same refusal when the ids are
  given from another working folder.

T29 also checks duplicate ids. R4 does not state anything about ids, so that
check is extra, but it does no harm.

## Status

- Result: PASS
- Coverage: COMPLETE
