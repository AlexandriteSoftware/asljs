# `ContextTaskTask` (`context-task`)

## Purpose

Sets the `task` field of the current envelope.

## Parameters

- `task` (`string`, required).

## How it works

Assigns `context.task = task` directly.

## Requires

- `requiresEnvelope: true`.
- Operates directly on the current `Context`.

## Notes

- `task` is optional on `Context`; `ContextProcessTask` only includes it in
  the Copilot prompt when it has been set to a non-blank value.
- See also `ContextInstructionTask` (`context-instruction`), which sets the
  sibling `instruction` field.
