# `EnvelopeAddFilesTask` (`envelope-add-files`)

## Purpose

Adds files matching a pattern to the current envelope. This is the task form
of the `read` patch command, and is also what `EnvelopeUpdateFilesTask` runs
for each file's stored update command.

## Parameters

`ReadParameters` (see [`../commands/read.ts`](../commands/read.ts)):

- `pattern` (`string`, required) - a file, folder, or glob pattern.
- `exclude` (`string[]`, optional).
- `lines` (`number`, optional, default `150`).
- `sizeKb` (`number`, optional, default `15`).
- `readToEnd` (`boolean`, optional, default `false`).
- `withBinaryB64` (`boolean`, optional, default `false`).

## How it works

Delegates to `EnvelopeTool.addFiles(envelope, parameters, rollbackFeed)`,
which runs the `read` command against the envelope currently stored in
context data (`envelopeData`). The envelope object is mutated in place: read
files are appended to `envelope.files`.

## Requires

- `requiresEnvelope: true` - the CLI host loads (or initializes) the envelope
  before running this task and saves it afterwards.
- Context data: `envelopeData` (required), `rollbackFeedData` (optional; used
  by `apply-patch` to make the file read patch-transactional - reading itself
  has no rollback because it doesn't mutate local files).
