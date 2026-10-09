# R2 Requirements model

The model is a directed acyclic graph of requirements and tests, built from
markdown files and the links in each requirement's `## Implementation` list, and
nothing else: links anywhere else in a requirement, and every link in a test,
are references, not edges.

## Implementation

- [R3 Node kinds][R3]
- [R4 Requirement hierarchy][R4]
- [R5 Tests][R5]
- [R6 Status section][R6]
- [T24 Edges][T24]

[R3]: <R3 Node kinds.md>
[R4]: <R4 Requirement hierarchy.md>
[R5]: <R5 Tests.md>
[R6]: <R6 Status section.md>
[T24]: <../tests/T24 Edges.md>

## Coverage

R2's statement is covered in full. Its clauses map to the linked items like
this:

- **"The model is a directed acyclic graph"**: R4 Requirement hierarchy covers
  the acyclic part. It requires no cycles and reports a cycle as a structure
  error. T29 checks this under R4.
- **"…of requirements and tests, built from markdown files"**: R3 Node kinds
  covers this. A file named `R<n> <name>.md` is a requirement, `T<n> <name>.md`
  is a test, and any other document is not part of the graph. T1 and T29 check
  this.
- **"…and the links in each requirement's `## Implementation` list"**: T24 Edges
  covers this. In its step `loadGraph follows only Implementation links to
  requirements and tests` (`src/graph.test.ts`), the Implementation link `R1 A →
  R2 B` becomes an edge. Its second step, `parseDocument reads a requirement:
  title, local links and Implementation links`, checks that Implementation links
  are parsed separately from the other local links.
- **"…and nothing else: links anywhere else in a requirement… are references,
  not edges"**: T24 covers this too. In the same graph test, the body link `See
  [R3](<R3 C.md>)` in `R1 A` does not make an edge. `R3 C` becomes a separate
  root with no edges, and the link from `notes.md` makes no edge either.
- **"…and every link in a test, are references, not edges"**: R5 Tests covers
  this ("Links in a test are references, not edges"). R5 also says a test has no
  `## Implementation` section. T3 checks R5.

R6 Status section doesn't match any clause of R2's statement. It's still a valid
part of the model, since it describes the `## Status` section every node may
carry, so it leaves no gap. If you want the parent to describe all of its
children, you could add a phrase about the status section to R2's statement, but
coverage doesn't need it.

## Status

- Result: PASS
- Coverage: COMPLETE
