# `ContextInstructionTask` (`context-instruction`)

## Purpose

Sets the `instruction` field of the current envelope.

## Parameters

- `instruction` (`string`, required).

## How it works

Assigns `context.instruction = instruction` directly.

## Requires

- `requiresEnvelope: true`.
- Operates directly on the current `Context`.

## Notes

- Typically set once per context, before adding files or calling
  `context-process`.
- See also `ContextTaskTask` (`context-task`), which sets the sibling
  `task` field.
