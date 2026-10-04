# mcp-server-transport

The MCP servers use stdout as their protocol channel, and anything else that
writes to stdout breaks them. Explore the alternatives and choose one that every
MCP server in the repository uses.

Packages: `kb`, `cog`.

## The problem

Both servers implement JSON-RPC over stdio by hand: newline-delimited messages
on stdin, responses written with `process.stdout.write`.

- `apps/kb/src/mcp/main.ts` - the `kb-mcp` server, also started by
  `apps/kb/src/mcp/client.ts` (`startInternalServer`).
- `apps/cog/src/mcp.ts` - the task server that
  `apps/cog/src/tasks/copilot/acp-client.ts` registers with Copilot, which
  starts it.

stdout is shared by everything in the process: the logger, `console.log` in
this code or in any dependency, a warning a library prints, and any child
process started with an inherited stdout. One stray line and the client fails
to parse the stream. This has already happened once in testing: `cog`'s server
with `COG_LOG_LEVEL=debug` and no log file wrote two `DEBUG` lines between its
JSON-RPC responses. Both servers now refuse to log to stdout at startup, so the
logger is no longer the risk, but the same line from anywhere else would break
them just as well. The children the servers start today use piped stdio, so
they are safe, but nothing enforces that.

The logger is covered by the rules in `docs/Logging.md`: an MCP server throws
at startup when asked to log to stdout, and `--logfile stderr` is how it logs to
the console. That does not cover `console.log` in this code or a dependency, or
a library's own warnings. Keeping stdout clean by discipline, one rule per
dependency, does not scale. The transport has to make it structural.

## Alternatives

### 1. Stdio, with stdout reserved by the server

At startup, before anything else runs, the server keeps a private reference to
the real stdout writer for protocol messages, then points `process.stdout.write`
and `console.log`/`console.info`/`console.debug` at stderr.

- Works with every MCP client unchanged; stdio is what clients launch by
  default.
- Catches the logger, `console.*` and libraries that write through
  `process.stdout`.
- Does not catch native code or child processes that write to file descriptor 1
  directly; children must keep using piped stdio, which a test can check.
- The MCP specification allows servers to write anything to stderr, and clients
  show or record it, so nothing is lost.
- Small: one module shared by both servers.

### 2. Streamable HTTP

The server listens on `127.0.0.1` and the client connects by URL; the protocol
never touches stdout. Defined by the MCP specification since 2025-03-26.

- stdout and stderr are free for logging.
- The server's lifecycle becomes a problem: something must start it, pick a
  port, tell the client, and stop it. A client that launches servers by command
  (Copilot through `acp-client.ts`) would need a wrapper that starts the HTTP
  server and bridges stdio to it, which brings stdio back.
- The specification requires validating `Origin` and binding to localhost;
  a local port is reachable by every process of the user.
- More code and more ways to fail than the stdio server it replaces.

### 3. Official SDK, `@modelcontextprotocol/sdk`

Replace the hand-written JSON-RPC with the SDK's server and its
`StdioServerTransport` or `StreamableHTTPServerTransport`.

- Not a transport choice by itself: the SDK's stdio transport writes to
  `process.stdout` like the current code, so it needs option 1 as well.
- Removes the hand-written framing, error responses and capability
  negotiation in two places, and keeps up with protocol revisions.
- Makes switching between stdio and HTTP a configuration change rather than a
  rewrite.
- Adds a dependency to both applications.

### 4. A separate file descriptor

Exchange messages on file descriptor 3 instead of stdout. No MCP client
supports it, so it only works where the repository controls both ends, which
excludes Copilot.

## Proposal to evaluate

Option 1 now, as a small shared module that both servers call first, with a
test that a `console.log` and a logger write during a request do not reach
the protocol stream. Then decide on option 3 separately, on its own merits;
it combines with option 1. Keep option 2 for a server that has to be shared
by several clients or run remotely, which neither server needs today.

Points to settle:

- Where the shared module lives. Both servers are applications; a small
  library, or a module in `asljs-logging` if it ends up owning the stderr
  redirection, are the candidates.
- Windows behaviour of the redirection, since the tools are developed there.

Record the decision in `docs/` and update the logging rules in
`docs/Logging.md` under "Tools whose stdout is their output".

## Where

- `apps/kb/src/mcp/main.ts`, `apps/kb/src/mcp/client.ts`
- `apps/cog/src/mcp.ts`, `apps/cog/src/tasks/copilot/acp-client.ts`
- `docs/Logging.md`

