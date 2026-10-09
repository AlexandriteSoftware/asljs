# rq-mcp

`rq-mcp` is an MCP server with a tool per `rq` command, so that an AI agent can
check, test and change requirements without a shell.

## Running it

```bash
rq-mcp
```

It reads JSON-RPC requests from standard input, one per line, and writes the
responses to standard output, as the Model Context Protocol's stdio transport
does; it stops when standard input ends. An MCP client starts it, e.g. in a
Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "rq": {
      "command": "npx",
      "args": [ "rq-mcp" ]
    }
  }
}
```

## Tools

A tool per command, named by the command, with `_` between a command and its
subcommand: `test`, `coverage`, `view`, `check`, `list`, `links`, `backlinks`,
`tojson`, `add_requirement`, `add_test`, `link`, `unlink`, `remove`, `move` and
`log`. Each tool's arguments are the command's arguments and options, by name:

```json
{
  "name": "test",
  "arguments": {
    "targets": [ "R1" ],
    "recurse": true,
    "workingDir": "dev/rq"
  }
}
```

- an argument that takes several values, such as `targets`, is an array;
- an option without a value, such as `recurse`, is a boolean;
- an option with an optional value, such as `ai`, takes a string, and an empty
  string gives the option without one: `"ai": ""` is `--ai`;
- `workingDir` is the folder the command works in; by default the folder
  `rq-mcp` was started in.

A call runs that command line, and the result is what it printed. A command that
exits with a non-zero code - a failed test, a structure error - is an error
result that ends with `Exit code: <n>`. Calls run one at a time.

`test` with instruction steps and `coverage` run an AI agent, and can take
minutes per test or requirement. `view` starts the server inside `rq-mcp`; it
serves until standard input ends, when `rq-mcp` closes it.

## Logging

`rq-mcp` logs nothing unless asked to, with `--loglevel`, `--logfile` and
`--logformat`, or `RQ_LOG_LEVEL`, `RQ_LOG_FILE` and `RQ_LOG_FORMAT`. Standard
output carries the protocol, so a level without a log file, or with `--logfile
stdout`, is refused at startup; log to standard error, which MCP clients show,
or to a file:

```bash
rq-mcp --loglevel debug --logfile stderr
```

At `debug` it logs each tool call and, as `rq` does, each command, test, step
command, agent and post-processing run; at `trace` also each request, the
agents' prompts and their output. A line that is not valid JSON is skipped and
logged as a warning.
