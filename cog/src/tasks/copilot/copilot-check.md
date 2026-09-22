# `CopilotCheckTask` (`copilot-check`)

## Purpose

Smoke-tests the Copilot ACP integration: starts the ACP server, sends a
couple of trivial prompts, and confirms it responds, then always stops the
server again.

## Parameters

- `prompts` (`string[]`, optional) - defaults to
  `['Reply with exactly: PING', 'Reply with exactly: PONG']`.

## How it works

1. Gets the `copilot` tool (`CopilotAcpTool`) directly (not the `copilot`
   service - this task manages the process lifecycle itself).
2. Calls `copilot.start()`, which spawns `copilot --acp --stdio` and performs
   the `initialize` / `session/new` handshake.
3. Sends each prompt in turn with `copilot.prompt(text)` and collects the
   responses. Throws if any response is empty after trimming.
4. In a `finally` block, always calls `copilot.stop()`, even if a prompt
   failed.

## Returns

`CopilotCheckResult` - `{ sessionId?: string; responses: string[] }`.

## Failure modes

- Throws if any prompt returns an empty response.
- Propagates any failure from `start()`, `prompt()`, or the underlying ACP
  process; the server is still stopped in all cases.
