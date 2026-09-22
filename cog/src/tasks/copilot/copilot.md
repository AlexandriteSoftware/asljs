# `CopilotTask` (`copilot`)

## Purpose

Sends a single completion request to the shared Copilot service and returns
its response. This is the lowest-level way to talk to Copilot from a
workflow; other tasks (`GetCommitMessageTask`, `TodoTask`,
   `ContextProcessTask`) build a prompt and then either call this task or the
service directly.

## Parameters

`CopilotRequest`:

- `prompt` (`string`, required).
- `files` (`ContextFile[]`, optional) - files to append to the Copilot request.

## How it works

1. Resolves the `copilot` service with `context.getService<CopilotService>
   ('copilot')`. The CLI host registers `CopilotAcpService`, which lazily
   starts a `CopilotAcpTool` (the `copilot --acp --stdio` process) on first
   use and reuses that same process for later calls.
2. Calls `copilot.complete(this.request)` and returns the result unchanged.

## Returns

`CopilotResponse` - `{ content: string }`.

## Notes

- Does not start or stop the Copilot process itself; that is the service's
  responsibility, and the process is stopped when the service provider is
  disposed (for example, when the CLI host shuts down).
