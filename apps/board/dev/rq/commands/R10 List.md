# R10 List

`board list` prints the documents column by column, each with its status - `NEW`
or `PLANNED` for an idea, `NEW` or `TASKS` for a plan, `TODO` or its result's
status for a task, its status for a result - and its open questions, or the same
as JSON with `--json`; it reports misplaced and duplicate documents.

## Implementation

- [T8 List][T8]

[T8]: <../tests/T8 List.md>

## Coverage

Every statement of R10 is covered by T8. Both of its steps run `execList` from
`src/list.test.ts` on the standard fixture board.

- **Documents printed column by column:** T8 step 1 checks the full output. It
  shows the headings Ideas, Plans, Tasks and Results in that order, with each
  document's path under its column.
- **Idea status `NEW` or `PLANNED`:** T8 step 1. I19, which has plan P19, shows
  as `PLANNED`, and I20, which has no plan, shows as `NEW`.
- **Plan status `NEW` or `TASKS`:** T8 step 1 shows P19, which has tasks, as
  `TASKS`. T8 step 2 adds P20 with no tasks and checks that it shows as `NEW`.
- **Task status `TODO` or its result's status:** T8 step 1. T19-1, which has
  result R19-1, shows `DONE`, the status of that result. T19-2, which has no
  result, shows `TODO`.
- **A result's own status:** T8 step 1 shows R19-1 as `DONE`.
- **Open questions:** T8 step 1 shows I20 with "1 open questions" in the text
  output and `openQuestions: 1` in the JSON.
- **The same data as JSON with `--json`:** T8 step 1 runs `execList` again with
  `json: true`. It checks that the columns are `idea`, `plan`, `task` and
  `result` in order, and checks the full record for I20: id, kind, subject,
  path, status and open-question count.
- **Misplaced documents reported:** T8 step 1 puts P9 in Ideas and checks the
  error "a plan in Ideas; move it to Plans".
- **Duplicate documents reported:** T8 step 2 adds a second T19-1 and checks the
  error "ids must be unique".

The tests only show a task taking its result's status for a `DONE` result. That
still satisfies the statement as written, so nothing is missing.

Verdict: R10 is fully covered by T8.

## Status

- Result: PASS
- Coverage: COMPLETE
