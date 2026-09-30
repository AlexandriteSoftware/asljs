# `ContextUpdateFilesTask` (`context-update-files`)

## Purpose

Refreshes every context file that has a stored `update` command.

## Parameters

None.

## How it works

1. Reads `context.files` and collects each file's `update` (`ReadParameters`).
   Files without an `update` command are skipped.
2. For each collected `ReadParameters`, creates and runs an
   `context-add-files` task (`ContextAddFilesTask`) with those parameters.

## Requires

- Operates directly on `Context.files`.

## Notes

- This is a workflow task: it composes `context-add-files`, one run per
  stored update command, rather than doing the file I/O itself.
- The CLI persists refreshed context files in envelope-compatible storage.
