# `ContextWriteFileTask` (`context-write-file`)

## Purpose

Creates a project file or replaces its content.

## Parameters

`Write` (see [`../tools/envelope.ts`](../tools/envelope.ts)):

- `path` (`string`, required).
- `content` (`string`, required).

## How it works

Creates any missing parent directories and writes the new content to disk.

## Requires

- Operates on the current `Context`.
