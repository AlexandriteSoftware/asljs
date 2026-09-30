# `ContextProcessTask` (`context-process`)

## Purpose

Sends the current context's instruction, task, and files to Copilot through
the `copilot` task.

## Parameters

None.

## How it works

1. Reads instruction, task, and files from the current `Context`.
2. Builds a single prompt string:
  - `Instruction:` followed by `context.instruction`, if it is non-blank.
  - `Task:` followed by `context.task`, if it is set and non-blank.
  - For each file in `context.files`, a `File: <path>` header (with
     `(partial)` appended when `file.complete === false`), followed by the
     file content in a fenced code block. Text files include their `content`
     (or an empty string if missing); binary files show
     `(binary content omitted)` instead of their content.
3. Runs the `copilot` task with that prompt and `context.files`.
4. Returns the `CopilotResponse` unchanged.

## Requires

- Uses the current `Context` directly.
- The `copilot` service (used transitively by the `copilot` task).

## Notes

- Does not itself add files or set `instruction`/`task`; use
  `context-add-files`, `context-instruction`, and `context-task` first to
  populate the context.
- Returns Copilot's raw response; interpreting or applying it (for example as
  task) is the caller's responsibility.
