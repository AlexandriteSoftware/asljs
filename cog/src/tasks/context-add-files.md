# `ContextAddFilesTask` (`context-add-files`)

## Purpose

Adds files matching a pattern to `Context.files`. It is also what
`ContextUpdateFilesTask` runs
for each file's stored update command.

## Parameters

`ReadParameters` (see [`../tools/read.ts`](../tools/read.ts)):

- `pattern` (`string`, required) - a file, folder, or glob pattern.
- `exclude` (`string[]`, optional).
- `lines` (`number`, optional, default `150`).
- `sizeKb` (`number`, optional, default `15`).
- `readToEnd` (`boolean`, optional, default `false`).
- `withBinaryB64` (`boolean`, optional, default `false`).

## How it works

Reads matching files and appends or replaces entries in `context.files`.

## Requires

- The CLI host persists `Context.files` in envelope-compatible storage.
