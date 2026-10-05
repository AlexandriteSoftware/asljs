# MCP

## Purpose

How the MCP servers in this repository exchange messages, and how logging and
console output can break that exchange. The logging rules themselves are in
[Logging][LOG].

## The servers

- `kb-mcp` (`apps/kb`) - the knowledge base tools.
  - Entry point: `main` in `apps/kb/src/mcp/main.ts`. The protocol loop is
    `runMcpServer` in `apps/kb/src/mcp/server.ts`.
  - Started by the `kb` CLI for one command (`startInternalServer` in
    `apps/kb/src/mcp/client.ts`), or by any MCP client that launches it.
  - With `--listen`, also serves an endpoint: a unix socket in the temporary
    directory, or a named pipe on Windows, at an address derived from the
    library root (`apps/kb/src/mcp/endpoint.ts`). A client finds a running
    server there without being told where it is.
- The `cog` task server (`apps/cog/src/mcp.ts`), named `asljs-cog-tasks`.
  - Started by Copilot. `apps/cog/src/tasks/copilot/acp-client.ts` registers it
    in the ACP `session/new` request as a command, `node` with the path of
    `mcp.js`, and Copilot launches it.

## Protocol

Both servers implement JSON-RPC 2.0 by hand, without an MCP SDK.

- Framing: one JSON message per line, separated by `\n`. Input arrives in
  chunks; a partial line is held until the rest of it arrives. `kb` reads
  through `readLines` (`apps/kb/src/mcp/lines.ts`), which its client also uses;
  `cog` has the same loop inline. Empty lines are skipped.
- Transport: stdin for requests, stdout for responses. A response is written as
  `JSON.stringify(message)` followed by `\n`, with `process.stdout.write`.
  `kb`'s `--listen` endpoint runs the same loop over each socket connection, so
  it uses neither stdin nor stdout.
- Protocol version: `2024-11-05`, returned by `initialize`.
- Methods: `initialize`, `tools/list` and `tools/call`. Any other method is
  answered with error `-32601`, `Method not found`.
- Notifications, messages without an `id`, get no response.
- A tool that fails is reported as a result with `isError: true`, not as a
  protocol error.
- Lifetime: a server ends when its stdin ends. A `kb` server started with
  `--listen` outlives stdin and stops on `SIGINT` or `SIGTERM`.

## What else writes to stdout

stdout belongs to the whole process, not to the protocol. Anything that writes
to it inserts a line into the response stream:

- the logger, when it is configured to write to stdout;
- `console.log`, `console.info` and `console.debug`, in this code or in any
  dependency;
- a library that writes to `process.stdout` itself;
- a child process started with an inherited stdout.

Nothing in either server intercepts these. The servers rely on the logger
refusing stdout (below), on not calling `console.log`, and on starting children
with piped stdio.

The following go to stderr and do not disturb the protocol:

- `console.error` and `console.warn`;
- Node's own warnings, and the stack trace of an exception nobody handles.

## What a stray line does

The client reads every line as a JSON-RPC message. What a line that is not one
does depends on the client:

- An MCP client such as Copilot may fail to parse the stream and drop the
  connection. This happened in testing: `cog`'s server with
  `COG_LOG_LEVEL=debug` and no log file wrote `DEBUG` lines between its
  responses, before the logger refused stdout.
- `kb`'s own client ignores a line that is not valid JSON or has no numeric `id`
  (`parseMessage` in `apps/kb/src/mcp/client.ts`). A stray line is lost, not
  fatal. A stray line that happens to be valid JSON with the `id` of a pending
  request would be taken as its answer.

## Logging

Both servers create their logger provider with `{ allowStdout: false }`:

- With no `--loglevel` and no `<APP>_LOG_LEVEL`, nothing is logged, as for every
  tool.
- A level with no `--logfile`, or with `--logfile stdout`, throws at startup,
  before the first message is read. The message names `--logfile stderr` and
  `--logfile <path>` as the alternatives.
- `--logfile stderr` or a file path logs normally. MCP clients read a server's
  stderr, so `stderr` is how to watch a server.

The `kb` CLI applies this for the server it starts (`childEnvironment` in
`apps/kb/src/mcp/client.ts`). When the caller set `KB_LOG_LEVEL` without
`KB_LOG_FILE`, or with `KB_LOG_FILE=stdout`, it passes `KB_LOG_FILE=stderr` to
the server. The server's stderr is inherited, so its log appears in the caller's
stderr.

Examples:

```pwsh
# Watch kb-mcp: the log goes to stderr, the protocol stays on stdout.
kb-mcp --library . --loglevel debug --logfile stderr

# Keep the log in a file instead.
kb-mcp --library . --loglevel debug --logfile build/kb-mcp.log

# Throws at startup: stdout carries the protocol.
kb-mcp --library . --loglevel debug
```

## Console output

There is no redirection of `console`. In server code:

- Do not call `console.log`, `console.info` or `console.debug`. Write
  diagnostics through the logger.
- `console.error` and `console.warn` are safe for the protocol, but they bypass
  the logger and its level, so prefer the logger for them as well.
- A dependency that prints to stdout breaks the server in the same way. Check a
  new dependency for that before a server uses it.

## Child processes

A child process with an inherited stdout writes into the protocol stream. The
processes the servers start today keep their stdout piped:

- `NodeCommandRunner` (`apps/cog/src/node-command-runner.ts`) - stdin ignored,
  stdout and stderr piped.
- The Copilot process started by `acp-client.ts` - all three streams piped,
  because it speaks ACP on its own stdio.
- `kb-mcp` started by the `kb` CLI - stdin and stdout piped for the protocol,
  stderr inherited so the server's log reaches the caller.

Keep `stdio` piped, or `ignore`, for stdout in any process a server starts.

## Edge cases

- `kb` logs a warning and skips a request line that is not valid JSON. `cog`
  parses each line without a guard, so a line that is not valid JSON throws out
  of the stdin handler and ends the process.
- `kb` ignores `EPIPE` on stdout, because the client closing the pipe on
  shutdown is not a failure. Any other stdout error is rethrown.
- `cog` is launched with an empty `env` list in the ACP registration, so its log
  settings depend on the environment Copilot gives it.

[LOG]: Logging.md
