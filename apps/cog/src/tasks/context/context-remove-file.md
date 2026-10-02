# `ContextRemoveFileTask` (`context-remove-file`)

## Purpose

Removes a project file and its corresponding envelope entry.

## Parameters

`ContextRemoveFileTaskParameters` (see
[`context-remove-file.ts`][SRC]):

- `path` (`string`, required).

## How it works

Deletes the file from disk and drops its entry from `context.files`.

## Requires

- Operates on the current `Context`.

[SRC]: context-remove-file.ts
