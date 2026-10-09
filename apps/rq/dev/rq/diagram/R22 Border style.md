# R22 Border style

A requirement's border is solid when its coverage is complete, dashed when it is
incomplete and dotted when it was never checked; a test's border is solid.

## Implementation

- [T16 Diagram borders][T16]

[T16]: <../tests/T16 Diagram borders.md>

## Coverage

I checked R22 against T16's two steps, which run tests in
`apps/rq/src/mermaid.test.ts`. I didn't change any files. R22 is fully covered
by T16 alone. Here is what covers each statement:

- **"A requirement's border is solid when its coverage is complete":** the step
  _getAppearance colours by result and styles a requirement by its coverage_
  gives `R2 Part.md` the status `Coverage: COMPLETE`. It then checks that R2
  comes out `green solid` (when T2 passes) and `amber solid` (when T2 fails).
  The same test also checks the rendered diagram: R2 (`n1`) is drawn as
  `stroke-width:2px` with no `stroke-dasharray`, which means a solid line.
- **"dashed when it is incomplete":** the same step gives `R1 Root.md` the
  status `Coverage: INCOMPLETE - speed`. It checks that R1 comes out `green
  dashed` and `amber dashed`. In the rendered diagram, R1 (`n0`) is drawn with
  `stroke-dasharray:6 4`, the dashed pattern.
- **"dotted when it was never checked":** the step _toMermaid draws requirements
  and tests by status, edges and links_ uses requirements that have no
  `Coverage` status. It checks that both R1 (`n0`) and R2 (`n1`) are drawn with
  `stroke-dasharray:2 3`. That is the dotted pattern defined in
  `apps/rq/src/mermaid.ts` (the `dotted` style).
- **"a test's border is solid":** both steps check this. The `getAppearance`
  step expects `tests/T1 Passes.md` and `tests/T2 Fails.md` to be `… solid`
  whether they pass or fail. In the rendered diagrams, the test nodes (`n2`,
  `n3` in the first step, `n2` in the second) are drawn with no
  `stroke-dasharray`. That holds for a passed test, a failed test and a test
  that never ran.

## Status

- Result: PASS
- Coverage: COMPLETE
