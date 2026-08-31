# `EnvelopeTaskTask` (`envelope-task`)

## Purpose

Sets the `task` field of the current envelope.

## Parameters

- `task` (`string`, required).

## How it works

Delegates to `EnvelopeTool.setTask(envelope, task)`, which assigns
`envelope.task = task` directly. There is no rollback handling because this
only changes the in-memory/persisted envelope, not project files.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData`.

## Notes

- `task` is optional on `Envelope`; `EnvelopeProcessTask` only includes it in
  the Copilot prompt when it has been set to a non-blank value.
- See also `EnvelopeInstructionTask` (`envelope-instruction`), which sets the
  sibling `instruction` field.
