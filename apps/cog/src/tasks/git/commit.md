# `CommitTask` (`commit`)

## Purpose

Commits all current changes using a Copilot-generated commit message.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Runs the `get-commit-message` task (`GetCommitMessageTask`) to obtain a
   commit message.
2. Calls `git.commit(workingDirectory, message)`, which stages all changes
   (`git add -A`) and commits them (`git commit -m <message>`).
3. Returns the commit message that was used.

## Failure modes

- Propagates `GetCommitMessageTask`'s failure when the working directory is
  not a Git repository (see [get-commit-message.md](./get-commit-message.md)).
- Throws if `git add` or `git commit` exits with a non-zero code (for example,
  when there is nothing to commit - use `commit-if-changed` to avoid that).

## Notes

- Requires the `git` tool and the `copilot` service (transitively, through
  `get-commit-message`).
