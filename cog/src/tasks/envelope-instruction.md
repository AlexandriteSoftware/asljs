# `EnvelopeInstructionTask` (`envelope-instruction`)

## Purpose

Sets the `instruction` field of the current envelope.

## Parameters

- `instruction` (`string`, required).

## How it works

Delegates to `EnvelopeTool.setInstruction(envelope, instruction)`, which
assigns `envelope.instruction = instruction` directly. There is no rollback
handling because this only changes the in-memory/persisted envelope, not
project files.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData`.

## Notes

- Typically set once per envelope, before adding files or calling
  `envelope-process`.
- See also `EnvelopeTaskTask` (`envelope-task`), which sets the sibling
  `task` field.
