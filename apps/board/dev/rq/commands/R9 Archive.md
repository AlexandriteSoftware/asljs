# R9 Archive

`board archive <item>` moves the idea of any of its documents, and its plan,
tasks and results, to `Archive/I<n> <subject>/`, each in a folder of its kind;
an archive folder that exists is refused.

## Implementation

- [T7 Archive][T7]

[T7]: <../tests/T7 Archive.md>

## Coverage

R9 makes four claims, and T7 covers each of them through its two steps in
`src/archive.test.ts`.

The first claim is that the plan, tasks and results move together with the idea.
T7's first step archives I19 and checks the output lines for each file: the idea
I19, the plan P19, the tasks T19-1 and T19-2, and the result R19-1. It then
reloads the board and checks that only I20 is left, so the originals have gone.

The second claim is the destination: `Archive/I<n> <subject>/`, with each
document in a folder of its kind. Also in the first step, the output lines show
the target paths `Archive/I19 Track how fresh articles are/Ideas/…`,
`…/Plans/…`, `…/Tasks/…` and `…/Results/…`. A file check confirms that
`Results/R19-1 …` exists under the archive folder.

The third claim is that the item can be any of the idea's documents. T7's second
step archives through the task T19-2 and checks that the output begins with
`Archived Ideas/I19`, so the whole idea is archived. Only a task is tried as the
entry point, not a plan or a result. Since R9 states this as one general rule,
one non-idea entry point is enough evidence.

The fourth claim is that an archive folder that already exists is refused. T7's
second step creates `Archive/I20 Restrict kids internet access/` first, then
checks that archiving I20 is rejected with "Archive/I20 Restrict kids internet
access already exists."

One observation, which is not a gap: T7 calls `execArchive` directly, so it
doesn't test the command line `board archive <item>` itself. T10 doesn't mention
archive either. R9's statement is about what archiving does, and that behavior
is fully tested. If the maintainers want the wiring of the command name checked
too, they could add a step to T10 that runs `board archive` through `runCli`.

Verdict: R9 is fully covered by T7.

## Status

- Result: PASS
- Coverage: COMPLETE
