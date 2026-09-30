# `TodoTask` (`todo`)

## Purpose

The TODO-driven workflow: finds the first TODO in the codebase, asks Copilot
to implement and remove it, verifies the result, and commits it - retrying
build and test fixes with Copilot along the way.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.
- `patterns` (`string[]`, optional) - forwarded to `find-todo`.

## How it works

1. Runs `commit-if-changed` so the working folder starts clean.
2. Runs `find-todo` with `patterns`. If there is no TODO, logs a debug
   message and returns `{ todo: null, addressed: false }` immediately.
3. Sends a prompt to the `copilot` service describing the TODO (file, line
   range, body, and excerpt) and asking it to:
   - implement the change, remove the TODO comment, and reply with exactly
     `TODO_DONE`; or
   - make no changes and reply with `TODO_STOP` followed by a reason, if it
     cannot implement it.
4. If the response starts with `TODO_STOP`, throws
   `stop: Copilot did not address the TODO in <file>:<line>: <reason>`.
5. Runs `find-todo` again with the same `patterns`. If a TODO with the same
   file, start line, and text is still present, throws - Copilot reported
   success without actually removing it.
6. Runs `format-changed-files` to format whatever Copilot changed.
7. Runs `build`, retrying up to 3 attempts: if `issues` is non-empty, sends a
   fix prompt to Copilot describing the issues and asking it to fix the code,
   then retries `build`. Throws if issues remain after the 3rd attempt.
8. Runs `test` the same way as step 7.
9. Runs `commit-if-changed` to commit the fix.
10. Returns `{ todo, addressed: true }`.

## Returns

`TodoTaskResult` - `{ todo: Todo | null; addressed: boolean }`.

## Failure modes

- Throws `stop: ...` when Copilot reports it could not address the TODO.
- Throws when the TODO is still present after Copilot claimed success.
- Throws `<build|test> still has issues after 3 attempts: ...` when Copilot
  can't fix a failing build or test within the retry limit.

## Notes

- Requires the `git`, `npm`, and `dotnet` tools, and the `copilot` service.
- Composes `commit-if-changed`, `find-todo`, `format-changed-files`, `build`,
  and `test` rather than talking to any tool directly (other than `copilot`
  for prompts).
