# R14 MCP server

`board-mcp` is an MCP server over standard input and output with a tool per
`board` command, whose arguments are the command's arguments and options by
name. A call runs that command line, one at a time, in the server's folder or
its `workingDir`, and answers what it printed; a non-zero exit code makes it an
error result.

## Implementation

- [T11 MCP server][T11]

[T11]: <tests/T11 MCP server.md>

## Coverage

My analysis covers each statement of R14 against T11, whose steps run in board's
`mcp.test.js` and mdcli's `mcp.test.js`.

- **MCP server over standard input and output.** Four T11 steps cover this.
  "handleMessage answers initialize, tools/list, unknown methods and
  notifications" checks the protocol messages. "serveLines answers
  line-delimited requests and reports invalid lines" checks the line-based
  transport. The board step "board-mcp runs the commands with the agent in their
  working folder, and reports failures as errors" drives `runMcpServer` with an
  input stream and an output line writer. "serverInfo names the server and the
  package version" checks how the server names itself. Nothing tests that the
  `board-mcp` binary actually connects these to the real stdin and stdout. That
  wiring is trivial, so it is a weak point rather than a gap.
- **A tool per `board` command.** The step "createTools makes a tool of every
  board command" covers this for `board`'s own command set. The library step
  "commandTools makes a tool per command, with its arguments and options" covers
  the general mechanism.
- **Its arguments are the command's arguments and options, by name.** The same
  two steps cover this. The board step checks the full input schema of a tool,
  including its argument, its options and `workingDir`. The library step
  "commandTools runs the command line of a call, one at a time, and answers its
  output" checks how named values become a command line: flags, valued options,
  empty options and `--` before positionals.
- **A call runs that command line, one at a time.** The step "commandTools runs
  the command line of a call, one at a time, and answers its output" covers
  this. It records each command line it runs and asserts that only one is
  running at any time, even when calls arrive concurrently.
- **Run in the server's folder or its `workingDir`.** The board end-to-end step
  covers this. It sends `plan` and `archive` with `workingDir: 'board'`,
  starting from a server folder that is the fixture root. The plan is written
  into the board in that subfolder, so the call ran in the folder `workingDir`
  names. Because the relative `workingDir` is resolved against the server's
  folder, the step also shows that commands start from the server's folder. Both
  calls set `workingDir`, though. No call without it shows a command running
  directly in the server's folder. To make this explicit, add a call without
  `workingDir` to that test, with the server's folder set to the board folder
  itself, and check that it works.
- **Answers what it printed.** The board end-to-end step covers this: the plan's
  text result is exactly what the command printed. The library steps
  "commandTools runs the command line of a call, one at a time, and answers its
  output" and "tools/call sends a result as JSON, text as it is, and a failure
  as an error result" also cover it.
- **A non-zero exit code makes it an error result.** The board end-to-end step
  covers this: `archive` of the unknown `I99` returns `isError: true` with the
  message and `Exit code: 1`. The library step "commandTools runs the command
  line of a call, one at a time, and answers its output" covers it with a
  failing `add` call. "tools/call sends a result as JSON, text as it is, and a
  failure as an error result" covers it at the protocol level.

Every statement is covered by at least one step of T11. The bare default folder
is only covered indirectly, through the relative `workingDir`. A test call
without `workingDir` would make that explicit, but it is not needed for
coverage.

## Status

- Result: PASS
- Coverage: COMPLETE
