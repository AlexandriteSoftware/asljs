# `ContextRemoveFileTask` (`context-remove-file`)

## Purpose

Removes a project file and its corresponding envelope entry.

## Parameters

`Remove` (see [`../tools/envelope.ts`](../tools/envelope.ts)):

- `path` (`string`, required).

## How it works

Deletes the file from disk and drops its entry from `context.files`.

## Requires

- Operates on the current `Context`.
