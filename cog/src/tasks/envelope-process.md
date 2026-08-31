# `EnvelopeProcessTask` (`envelope-process`)

## Purpose

Sends the current envelope's instruction, task, and files to Copilot through
the `copilot` task, so a single call kicks off processing of everything
gathered in the envelope so far.

## Parameters

None.

## How it works

1. Reads the envelope from context data (`envelopeData`).
2. Builds a single prompt string:
   - `Instruction:` followed by `envelope.instruction`, if it is non-blank.
   - `Task:` followed by `envelope.task`, if it is set and non-blank.
   - For each file in `envelope.files`, a `File: <path>` header (with
     `(partial)` appended when `file.complete === false`), followed by the
     file content in a fenced code block. Text files include their `content`
     (or an empty string if missing); binary files show
     `(binary content omitted)` instead of their content.
3. Runs the `copilot` task with that prompt: `context.run(context.createTask
   <CopilotResponse>('copilot', { prompt }))`.
4. Returns the `CopilotResponse` unchanged.

## Requires

- `requiresEnvelope: true`.
- Context data: `envelopeData`.
- The `copilot` service (used transitively by the `copilot` task).

## Notes

- Does not itself add files, apply a patch, or set `instruction`/`task`; use
  `envelope-add-files`, `envelope-instruction`, and `envelope-task` first to
  populate the envelope.
- Returns Copilot's raw response; interpreting or applying it (for example as
  a patch) is the caller's responsibility.
