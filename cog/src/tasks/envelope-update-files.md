# `EnvelopeUpdateFilesTask` (`envelope-update-files`)

## Purpose

Refreshes every envelope file that has a stored `update` command, so envelope
file snapshots can be brought back in sync with the project after other
changes were made.

## Parameters

None.

## How it works

1. Reads `envelope.files` from context data (`envelopeData`) and collects the
   `update` (`ReadParameters`) of every file that has one, via
   `EnvelopeTool.getUpdateParameters(envelope)`. Files without an `update`
   command are skipped.
2. For each collected `ReadParameters`, creates and runs an
   `envelope-add-files` task (`EnvelopeAddFilesTask`) with those parameters,
   which re-reads the matching file(s) and updates their envelope entries.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData`.

## Notes

- This is a workflow task: it composes `envelope-add-files`, one run per
  stored update command, rather than doing the file I/O itself.
- Used by `apply-patch` after patch commands are applied and verified, to
  refresh envelope file snapshots before saving the envelope.
