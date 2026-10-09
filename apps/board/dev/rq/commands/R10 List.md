# R10 List

`board list` prints the documents column by column, each with its status - `NEW`
or `PLANNED` for an idea, `NEW` or `TASKS` for a plan, `TODO` or its result's
status for a task, its status for a result - and its open questions, or the same
as JSON with `--json`; it reports misplaced and duplicate documents.

## Implementation

- [T8 List][T8]

[T8]: <../tests/T8 List.md>

## Coverage

R10 is fully covered by T8. Each statement maps to a step of T8 as follows:

- **Columns in order.** "`board list` prints the documents column by column" is
  covered by T8 step 1 ("execList prints the columns with the status and open
  questions of each item"). It checks the exact text output, with the headings
  Ideas, Plans, Tasks and Results in that order and each document under its
  column.
- **Idea status.** "`NEW` or `PLANNED` for an idea" is covered by T8 step 1. I19
  has plan P19 and shows `PLANNED`. I20 has no plan and shows `NEW`.
- **Plan status.** "`NEW` or `TASKS` for a plan" is covered by both steps of T8.
  In step 1, P19 has tasks and shows `TASKS`. In step 2 ("execList shows a plan
  without tasks as NEW, and reports an id used twice"), P20 has no tasks and
  shows `NEW`.
- **Task status.** "`TODO` or its result's status for a task" is covered by T8
  step 1. T19-2 has no result and shows `TODO`. T19-1 has result R19-1 and shows
  `DONE`, which is that result's status.
  - One weak spot: the fixture only uses `DONE`, so a version that printed a
    fixed `DONE` for any task with a result would also pass.
  - To make it stronger, a result with a different status (for example
    `Blocked`) could be added, with a check that its task shows that status.
    Coverage does not depend on this.
- **Result status.** "Its status for a result" is covered by T8 step 1, where
  R19-1 shows `DONE`.
- **Open questions.** "And its open questions" is covered by T8 step 1. I20 is
  printed with "- 1 open questions", and its JSON entry has `openQuestions: 1`.
- **JSON output.** "Or the same as JSON with `--json`" is covered by T8 step 1.
  It runs with `json: true` and checks:
  - the column keys `idea`, `plan`, `task` and `result`, in that order;
  - the full JSON entry for I20, including its id, kind, subject, path, status
    and open-question count.
- **Misplaced documents.** "It reports misplaced documents" is covered by T8
  step 1. `Ideas/P9 Misplaced.md` produces the error "a plan in Ideas; move it
  to Plans".
- **Duplicate documents.** "It reports duplicate documents" is covered by T8
  step 2. A second T19-1 file produces the error "ids must be unique".

**Verdict:** every statement of R10 is covered by T8.

## Status

- Result: PASS
- Coverage: COMPLETE
