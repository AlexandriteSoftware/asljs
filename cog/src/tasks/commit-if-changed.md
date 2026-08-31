# `CommitIfChangedTask` (`commit-if-changed`)

## Purpose

Commits all current changes, or does nothing when the working folder is
already clean, so callers don't have to check for changes themselves before
committing.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Reads the list of modified and untracked files with
   `git.getChangedFiles()`.
2. If that list is empty, logs a debug message and returns `null` without
   running `commit`.
3. Otherwise runs the `commit` task (`CommitTask`) and returns its result (the
   commit message that was used).

## Returns

`string | null` - the commit message, or `null` when there was nothing to
commit.

## Notes

- Requires the `git` tool and, when there are changes, the `copilot` service
  (transitively, through `commit` -> `get-commit-message`).
- Used by `TodoTask` both to start from a clean state and to commit whatever
  Copilot changed.
