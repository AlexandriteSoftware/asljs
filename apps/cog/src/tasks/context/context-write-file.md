# `ContextWriteFileTask` (`context-write-file`)

## Purpose

Creates a project file or replaces its content.

## Parameters

`ContextWriteFileTaskParameters` (see
[`context-write-file.ts`][SRC]):

- `path` (`string`, required).
- `content` (`string`, required).

## How it works

Creates any missing parent directories and writes the new content to disk.

## Requires

- Operates on the current `Context`.

[SRC]: context-write-file.ts
