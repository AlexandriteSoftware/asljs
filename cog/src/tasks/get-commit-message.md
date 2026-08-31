# `GetCommitMessageTask` (`get-commit-message`)

## Purpose

Asks Copilot for a commit message that summarises the current working
folder's changes.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

1. Checks `git.isRepository(workingDirectory)`. If it is not a Git
   repository, throws `stop: <workingDirectory> is not a git repository` -
   the `stop:` prefix signals a workflow should abort here rather than retry.
2. Reads the diff against `HEAD` with `git.getDiff()`.
3. Reads the list of untracked paths with `git.getUntrackedFiles()`, then
   reads each file's text content (or substitutes
   `(binary or unreadable file)` if it can't be read as UTF-8).
4. Builds a single prompt containing the diff (in a fenced ` ```diff ` block),
   one section per untracked file, and an instruction telling Copilot to
   reply with only a commit message summary under 200 characters.
5. Sends that prompt through the `copilot` service (`context.getService
   <CopilotService>('copilot').complete({ prompt })`).
6. Returns the trimmed response content.

## Returns

`string` - the commit message.

## Failure modes

- Throws (`stop: ...`) when the working directory is not a Git repository.
- Propagates any Git or Copilot service failure.

## Notes

- Requires the `git` tool and the `copilot` service.
- Used by `CommitTask`, which takes the returned message and actually commits.
