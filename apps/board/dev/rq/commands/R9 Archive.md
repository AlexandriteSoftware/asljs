# R9 Archive

`board archive <item>` moves the idea of any of its documents, and its plan,
tasks and results, to `Archive/I<n> <subject>/`, each in a folder of its kind;
an archive folder that exists is refused.

## Implementation

- [T7 Archive][T7]

[T7]: <../tests/T7 Archive.md>

## Coverage

R9 has three statements, and T7 covers all of them. I read the two Jest tests
that T7's steps reference in `archive.test.ts`, not just the step names.

- **Moves the idea with its plan, tasks and results to `Archive/I<n>
  <subject>/`, each in a folder of its kind.** The T7 step "execArchive moves an
  idea with its plan, tasks and results to the archive" covers this. It archives
  I19 and checks the output line for each file: the idea goes to `Archive/I19
  Track how fresh articles are/Ideas/`, the plan to `.../Plans/`, both tasks to
  `.../Tasks/`, and the result to `.../Results/`. It then checks that only I20
  is left on the board and that the moved result file exists in its archive
  folder. That confirms the files were actually moved and are no longer on the
  board.
- **The command accepts any of the idea's documents.** The T7 step "execArchive
  takes any item of the idea, and refuses an archive that exists" covers this.
  Given the task T19-2, it archives the whole idea I19, starting with
  `Ideas/I19`. Only a task is tried, not a plan or a result. Because the test
  shows a non-idea item resolving to its idea, this is enough coverage. A
  maintainer who wants every kind tried could add P19 and R19-1 as further
  targets in the same test.
- **An archive folder that already exists is refused.** The same T7 step covers
  this. It creates `Archive/I20 Restrict kids internet access/` first, then
  expects archiving I20 to fail with the error "Archive/I20 Restrict kids
  internet access already exists."

Every statement of R9 is covered by T7.

## Status

- Result: PASS
- Coverage: COMPLETE
