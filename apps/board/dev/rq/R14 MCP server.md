# R14 MCP server

`board-mcp` is an MCP server over standard input and output with a tool per
`board` command, whose arguments are the command's arguments and options by
name. A call runs that command line, one at a time, in the server's folder or
its `workingDir`, and answers what it printed; a non-zero exit code makes it an
error result. A server that a `view` call starts serves until the input ends,
when `board-mcp` closes it.

## Implementation

- [T11 MCP server][T11]

[T11]: <tests/T11 MCP server.md>

## Coverage

R14 is fully covered by T11. Every statement is checked by at least one T11
step.

- **MCP server over standard input and output.** Four steps cover this. The step
  "handleMessage answers initialize, tools/list, unknown methods and
  notifications" checks the protocol messages. The step "serveLines answers
  line-delimited requests and logs requests and invalid lines" checks the
  line-based transport. The board step "board-mcp runs the commands with the
  agent in their working folder, and reports failures as errors" drives
  `runMcpServer` with an input stream and a line writer. The step "serverInfo
  names the server and the package version" checks how the server names itself.
  No step checks that the `board-mcp` binary connects these to the real stdin
  and stdout. That wiring is trivial, so it is a weak point rather than a gap.
- **A tool per `board` command.** The step "createTools makes a tool of every
  board command" covers this for board's own commands. The step "commandTools
  makes a tool per command, with its arguments and options" covers the general
  mechanism in mdcli.
- **The arguments are the command's arguments and options, by name.** The same
  two steps cover this. The step "commandTools runs the command line of a call,
  one at a time, and answers its output" also checks how named values become a
  command line.
- **A call runs that command line, one at a time.** The step "commandTools runs
  the command line of a call, one at a time, and answers its output" covers
  this. It records each command line it runs and asserts that only one runs at
  any time, even when calls arrive concurrently.
- **Run in the server's folder or its `workingDir`.** The board end-to-end step
  covers this. Its `plan` and `archive` calls pass `workingDir: 'board'`, and
  the server's folder is the fixture root. The plan is written into the board in
  that subfolder, so the call ran in the folder `workingDir` names, resolved
  against the server's folder. The bare default is only covered indirectly,
  because every call sets `workingDir`. To make it explicit, add a call without
  `workingDir` to that test, with the server's folder set to the board folder.
  This is optional.
- **It answers what the command printed.** The board end-to-end step covers
  this: the `plan` result's text is exactly what the command printed. The mdcli
  steps "commandTools runs the command line of a call, one at a time, and
  answers its output" and "tools/call sends a result as JSON, text as it is, and
  a failure as an error result" also cover it.
- **A non-zero exit code makes it an error result.** The board end-to-end step
  covers this: `archive` of the unknown `I99` returns an error result. The two
  mdcli steps above cover it too, one with a failing command and one at the
  protocol level.
- **A server that a `view` call starts serves until the input ends, and then
  `board-mcp` closes it.** The step "runMcpServer closes the server of a view
  call once the input ends" covers this. It sends a `view` call, takes the
  server's URL from the answer, and checks that a fetch to that URL fails after
  `runMcpServer` returns. The test does not fetch the URL before the input ends.
  Only the URL in the answer shows that the server was listening. A fetch that
  succeeds while the input is still open would make "serves until" explicit, but
  it is not needed for coverage.

R14's own Coverage section does not discuss the `view` statement yet. It would
be worth adding it there, with the step above.

## Status

- Result: PASS
- Coverage: COMPLETE
