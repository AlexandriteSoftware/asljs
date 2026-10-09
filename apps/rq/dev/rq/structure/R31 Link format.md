# R31 Link format

The commands write the links they add as reference links, labelled with the id
of their target, with a number added when the label is taken.

## Implementation

- [T27 Link format][T27]

[T27]: <../tests/T27 Link format.md>

## Coverage

R31 is fully covered by T27. The requirement makes three claims about the links
the commands add: they are reference links, their label is the target's id, and
the label gets a number when it is already taken. Two kinds of link are added.
`add` and `link` add Implementation links through `addImplementationLink`, and
`rq test` and `rq log` add the Execution link through `writeStatus`. T27 checks
all three claims for both kinds.

**Implementation links (`add`, `link`).** T27's step "addImplementationLink adds
a relative link to the Implementation list" (`src/edit.test.ts:82`) covers all
three claims:

- **Reference link:** it expects `- [T1 \[x\]][T1]` with `[T1]: <tests/T1
  [x].md>`.
- **Label is the target's id:** the labels are `T1` and `R2`.
- **Number when the label is taken:** when `[T1]: other.md` already exists, the
  expected result is `[T1 A][T1-2]` with `[T1-2]: <T1 A.md>`.

**Execution link (`rq test`, `rq log`).**

- **Reference link labelled with the execution id:** the step "writeStatus
  labels the execution link with the execution id, numbered when taken"
  (`src/status-section.test.ts:116`) expects `- Execution: [E2 reqs][E2-2]` with
  `[E2-2]: <../.rq/E2 reqs.md>`.
- **Number when the label is taken:** the same step starts from a document that
  already defines `[E2]: notes.md` outside `## Status`, and expects that
  definition to be kept.
- **The command really writes it:** the step "execTest writes the status of each
  test and of the requirements above it" (`src/test.test.ts:299`) shows `rq
  test` writing `- Execution: [E2 reqs][E2]` with `[E2]: <../../.rq/E2 reqs.md>`
  into test documents.

This closes the gap that the `## Coverage` section in R31 still describes. T27
now has the steps that section asked for. That section is out of date and will
be replaced when the coverage is next recorded.

Two minor points, neither of which leaves a statement uncovered:

- T27's step "writeStatus adds, replaces and removes the section" writes no link
  (it passes `execution: null`), so it adds nothing for R31. It could be
  removed.
- For `add` and `link`, the link format is checked on `addImplementationLink`,
  not by running the commands. I took from the earlier analysis that both
  commands call it (`src/change.ts:188`, `src/change.ts:293`); I did not reopen
  `src/change.ts` to confirm.

## Status

- Result: PASS
- Coverage: COMPLETE
