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

R2 has three statements. Between them, R12 and T1 cover all three.

The first statement says a board is a folder with one folder per stage, and that
folder is also the stage's column. Ideas sit in `Ideas/I<n> <subject>.md`, plans
in `Plans/P<n> <subject>.md`, tasks in `Tasks/T<n>-<m> <subject>.md` and results
in `Results/R<n>-<m> <subject>.md`. R12 covers this: it says a document's id and
kind come from its file name, and that a document in another kind's folder is
reported and left out. T1 checks it in three steps:

- The parseId/getItemId step checks the `I<n>`, `P<n>`, `T<n>-<m>` and
  `R<n>-<m>` id shapes. It rejects malformed ones such as `I19-2` and `T19`, and
  reads the id from a path like `Plans/P7 Do it.md`.
- The loadBoard step reads ideas, plans, tasks and results from their folders.
  It reports a plan placed in `Ideas` as misplaced.
- The itemPath step checks that a new task is named `Tasks/T1-2 <subject>.md`.

The column side of the statement is only naming. The column is the folder, so
the folder layout checks cover it.

The second statement says `Archive/` holds what is done and is not read. T1's
loadBoard step writes `Archive/I1 Old/Ideas/I1 Old.md` and asserts that it is
not among the loaded items. It also asserts that no problem is reported for it,
even though its id would otherwise clash with nothing.

The third statement says the plan, tasks and results of idea n share its number.
T1's findItem/itemsOf step covers it: `itemsOf(board, 19)` returns I19 together
with P19, T19-1, T19-2 and R19-1. For an idea with no plan, `itemsOf(board, 20)`
returns no plan. The parseId step also confirms that the number `n` is read from
every kind of id.

R3 (open questions) covers no statement of R2. It is a separate model concern
attached under R2. That is harmless, but R2's text does not mention open
questions. If R3 is meant to belong to the board model, add a sentence to R2
saying documents carry their unsettled points as open questions. If it isn't,
move R3 to whichever requirement does own it. Neither choice changes this
verdict.

## Status

- Result: PASS
- Coverage: COMPLETE
