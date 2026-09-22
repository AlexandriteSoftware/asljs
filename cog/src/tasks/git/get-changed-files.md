# `GetChangedFilesTask` (`get-changed-files`)

## Purpose

Lists the modified and untracked files in a working directory.

## Parameters

- `workingDirectory` (optional) - defaults to `process.cwd()`.

## How it works

Delegates to `GitTool.getChangedFiles(workingDirectory)`, which runs
`git status --porcelain=v1 -z --untracked-files=all` and parses the output
into a de-duplicated list of paths (modified, staged, renamed, copied, and
untracked).

## Returns

`string[]` - relative file paths.

## Notes

- Requires the `git` tool.
- Used by `FormatChangedFilesTask` (to know what to format) and
  `CommitIfChangedTask` (to decide whether there is anything to commit).
