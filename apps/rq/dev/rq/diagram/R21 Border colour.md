# R21 Border colour

A node's border colour is its result: neutral for one not run, green for one
that passed, red for a failed test, amber for a requirement failing because of
what it links to.

## Implementation

- [T16 Diagram borders][T16]

[T16]: <../tests/T16 Diagram borders.md>

## Coverage

R21 is fully covered by T16. Both of T16's steps point to tests in
`src/mermaid.test.ts`, and between them they check every statement:

- **"A node's border colour is its result":** both steps derive the border from
  the statuses that `getStatuses` computes from the recorded results. The two
  `assert.deepEqual` cases in "getAppearance colours by result and styles a
  requirement by its coverage" give the same nodes different colours depending
  only on the results passed in.
- **"neutral for one not run":** covered by "toMermaid draws requirements and
  tests by status, edges and links". There, T2 and R2 (whose only link is T2)
  never ran, and both get `stroke:#9e9e9e`. The last `assert.match` in the
  getAppearance step checks the same thing again: with only T1 run, R1 (`n0`)
  and R2 (`n1`) are `#9e9e9e`.
- **"green for one that passed":** covered by the getAppearance step. When T1
  and T2 pass, both tests and both requirements are `green`. Its `assert.match`
  also checks the rendered `#2e7d32` for a passing test.
- **"red for a failed test":** covered by both steps. The getAppearance step
  gives the failed T2 `red solid`, and the toMermaid step renders the failed T1
  as `stroke:#c62828`.
- **"amber for a requirement failing because of what it links to":** covered by
  both steps. In the getAppearance step, T2 fails, so R2 (which links to it) is
  `amber` and so is R1 (which links to R2), so the failure is shown spreading up
  through a sub-requirement. In the toMermaid step, R1 is drawn `stroke:#ef8f00`
  when its linked T1 fails.

Nothing needs to be added.

## Status

- Result: PASS
- Coverage: COMPLETE
