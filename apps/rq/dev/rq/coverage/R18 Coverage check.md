# R18 Coverage check

`rq coverage` asks an AI agent whether each selected requirement's
sub-requirements and own tests provide sufficient functional coverage, and
writes the verdict to its `Coverage` status and the agent's analysis to its `##
Coverage` section: why it is complete, statement by statement, or what nothing
covers and what to add or change. It is independent of `rq test`: it runs no
test and records no result, and `rq test` keeps the coverage.

## Implementation

- [T14 Coverage check][T14]

[T14]: <../tests/T14 Coverage check.md>

## Coverage

R18 is fully covered by T14. The one gap the last coverage run found is now
closed: the prompt test in `src/coverage.test.ts` checks that the agent is asked
for a statement-by-statement analysis. I changed no files.

**What covers each statement of R18**

- **`rq coverage` asks an AI agent about each selected requirement's
  sub-requirements and own tests.**
  - T14 "checkCoverage asks the agent about a requirement and its links" checks
    that the agent is asked and that its answer is read correctly. It tries four
    answers: OK, Fail, no verdict, and the agent exiting with an error code.
  - T14 "checkCoverage prompt names the requirement and its links" checks that
    the prompt names the requirement, its sub-requirement as `(requirement)` and
    its test as `(test)`.
  - T14 "execCoverage records the verdict of each selected requirement in its
    Status" checks which requirements get checked:
    - a test given as a target (`T1`) is ignored;
    - `--recurse` reaches R2;
    - a requirement with no links gets "links to no requirement or test".
- **The verdict goes into its `Coverage` status.** "execCoverage records the
  verdict…" checks for `- Coverage: COMPLETE` and `- Coverage: INCOMPLETE -
  Nothing covers speed.` in `## Status`.
- **The agent's analysis goes into its `## Coverage` section.** Two tests cover
  this: "execCoverage writes the analysis to the Coverage section, before the
  Status" and "writeCoverageSection adds the section before the Status, or
  replaces it". Together they check that:
  - the section goes before `## Status`;
  - a heading in the agent's output is escaped;
  - a second run replaces the section instead of adding another one;
  - a requirement with no links gets a fixed analysis.

  The first `checkCoverage` test also checks that the text before the JSON line
  is passed on as the analysis.
- **The analysis explains, statement by statement, why the requirement is
  complete, or what nothing covers and what to add or change.** T14
  "checkCoverage prompt names the requirement and its links" now checks that the
  prompt contains:
  - `First write your analysis`
  - `for each statement, the requirement or test`
  - `each statement nothing covers, and what to do to cover`
  - `a test to add and what it should check, a sub-requirement to add`
  - `Then end with the verdict.`

  So the prompt is checked to ask for this content. That is the most a test can
  check, because what the agent actually writes is up to the agent.
- **It runs no test and records no result.** "execCoverage records the verdict…"
  checks that no `.rq/E2 R1.md` execution file is created and that R1 gets no `-
  Result:` line.
- **`rq test` keeps the coverage.** T14 "execTest writes the status of each test
  and of the requirements above it" (in `src/test.test.ts`) adds `- Coverage:
  COMPLETE` to R2's status. After `rq test` rewrites the status, the test checks
  that it ends with `- Result: PASS\n- Coverage: COMPLETE`.

**Optional:** the "runs no test" check could be made stronger by also checking
that `reqs/tests/T1 Passes.md` and `reqs/tests/T2 Fails.md` are unchanged after
`execCoverage`. It isn't required, because the statement is already covered by
the checks above.

The `## Coverage` section in R18 still describes the old gap, and its status
still says INCOMPLETE. Both will be overwritten when this verdict is recorded.

## Status

- Result: PASS
- Coverage: COMPLETE
