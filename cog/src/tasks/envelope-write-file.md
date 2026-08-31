# `EnvelopeWriteFileTask` (`envelope-write-file`)

## Purpose

Creates a project file or replaces its content, and records it in the
envelope. This is the task form of the `write` patch command.

## Parameters

`Write` (see [`../commands/write.ts`](../commands/write.ts)):

- `path` (`string`, required).
- `content` (`string`, required).

## How it works

Delegates to `EnvelopeTool.writeFile(envelope, parameters, rollbackFeed)`,
which runs the `write` command: it saves the file's current state to the
rollback feed (if one is provided), creates any missing parent directories,
and writes the new content to disk.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData` (required), `rollbackFeedData` (optional; when
  present, lets `apply-patch` restore the previous content if a later command
  in the same patch fails).
