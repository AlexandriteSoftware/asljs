# R2 Board model

A board is a folder with a folder per stage, which is also its column:
`Ideas/I<n> <subject>.md`, `Plans/P<n> <subject>.md`, `Tasks/T<n>-<m>
<subject>.md` and `Results/R<n>-<m> <subject>.md`, and `Archive/` for what is
done, which is not read. The plan, tasks and results of idea n share its number.

## Implementation

- [R3 Open questions][R3]
- [R12 Ids and documents][R12]
- [T1 Documents and ids][T1]

[R3]: <R3 Open questions.md>
[R12]: <R12 Ids and documents.md>
[T1]: <../tests/T1 Documents and ids.md>

## Coverage

R2 is fully covered. It makes three statements, and R12 and T1 between them
cover all three. R3 doesn't cover anything R2 says; it adds open questions to
the model.

The first statement says a board is a folder with one folder per stage, which is
also its column: `Ideas/I<n> <subject>.md`, `Plans/P<n> <subject>.md`,
`Tasks/T<n>-<m> <subject>.md` and `Results/R<n>-<m> <subject>.md`. R12 covers
this, because it says a document's id and kind come from its file name and that
a document in another kind's folder is reported and left out. T1 also checks it:

- The "parseId and getItemId" step reads the `I<n>`, `P<n>`, `T<n>-<m>` and
  `R<n>-<m>` ids from the stage folders.
- The "loadBoard reads the items of each folder" step loads ideas, plans, tasks
  and results from their own folders. It also reports a plan placed in `Ideas`
  as misplaced.

The second statement says `Archive/` holds what is done and is not read. T1's
"loadBoard reads the items of each folder" step covers it. The test behind that
step writes `Archive/I1 Old/Ideas/I1 Old.md`, and the test expects that item to
be missing from the loaded items. Only the code shows this; the step's title
doesn't mention Archive. If you want the coverage to be visible from the test
document, add Archive to that step's title.

The third statement says the plan, tasks and results of idea n share its number.
T1's "findItem … and itemsOf groups an idea" step covers it: `itemsOf` for idea
19 returns I19, P19, T19-1, T19-2 and R19-1. It also returns no plan for idea
20, which has none. The "parseId and getItemId" step checks that the number is
read from the id.

Nothing is left uncovered, and no changes are needed.

## Status

- Result: PASS
- Coverage: COMPLETE
