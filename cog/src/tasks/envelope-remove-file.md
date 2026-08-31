# `EnvelopeRemoveFileTask` (`envelope-remove-file`)

## Purpose

Removes a project file and its corresponding envelope entry. This is the task
form of the `remove` patch command.

## Parameters

`Remove` (see [`../commands/remove.ts`](../commands/remove.ts)):

- `path` (`string`, required).

## How it works

Delegates to `EnvelopeTool.removeFile(envelope, parameters, rollbackFeed)`,
which runs the `remove` command: it saves the file's current state to the
rollback feed (if one is provided), deletes the file from disk, and drops its
entry from `envelope.files`.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData` (required), `rollbackFeedData` (optional; when
  present, lets `apply-patch` restore the file if a later command in the same
  patch fails).
