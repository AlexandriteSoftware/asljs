# R33 MCP server

rq-mcp is an MCP server over standard input and output with a tool per rq
command, subcommands joined with _, whose arguments are the command's arguments
and options by name. A call runs that command line, one at a time, in the
server's folder or its workingDir, and answers what it printed; a non-zero exit
code makes it an error result. A server that a view call starts serves until the
input ends, when rq-mcp closes it.

## Implementation

- [T30 MCP server][T30]

[T30]: <tests/T30 MCP server.md>

## Coverage

R33 is fully covered by T30, the only node it links to. T30 has a step for each
statement of R33:

- **MCP server over standard input and output.** The T30 step "serveLines
  answers line-delimited requests and logs requests and invalid lines" reads
  requests line by line and writes one answer line for each. The step "rq-mcp
  runs the commands in their working folder, and reports failures as errors"
  sends requests to runMcpServer as lines and reads its output lines. The step
  "handleMessage answers initialize, tools/list, unknown methods and
  notifications" covers the protocol, and the step "serverInfo names the server
  and the package version" covers how the server names itself.
- **A tool per rq command, subcommands joined with _.** The step "createTools
  makes a tool of every rq command" checks the full list of tool names,
  including add_requirement and add_test. The step "commandTools makes a tool
  per command, with its arguments and options" checks that add test becomes
  add_test and that a skipped command gets no tool.
- **Arguments are the command's arguments and options, by name.** The step
  "createTools makes a tool of every rq command" checks that the test tool's
  properties are targets, recurse, name, ai and workingDir, and that targets is
  required. The step "commandTools makes a tool per command, with its arguments
  and options" checks the types, descriptions and required lists built from
  arguments and options.
- **A call runs that command line, one at a time.** The step "commandTools runs
  the command line of a call, one at a time, and answers its output" checks the
  exact command line built from a call, including the -- separator. It also
  starts two calls at once and checks that only one runs at a time.
- **In the server's folder or its workingDir.** The step "rq-mcp runs the
  commands in their working folder, and reports failures as errors" runs check
  and test with workingDir 'reqs', resolved against the server's folder, and
  gets that subfolder's results. In the view step, a call without workingDir
  runs in the server's folder: path 'reqs' is resolved against it. That step is
  not mainly about the default, though, so a check call without workingDir in
  the working-folder test would make the default case explicit.
- **Answers what it printed.** The step "rq-mcp runs the commands in their
  working folder, and reports failures as errors" checks the exact text check
  prints, "OK 2 requirements, 2 tests". The step "commandTools runs the command
  line of a call, one at a time, and answers its output" checks that the output
  comes back as text. The step "tools/call sends a result as JSON, text as it
  is, and a failure as an error result" covers how results are encoded.
- **A non-zero exit code makes it an error result.** The step "rq-mcp runs the
  commands in their working folder, and reports failures as errors" checks that
  a failing rq test gives isError true, with text ending in "Exit code: 1". The
  step "commandTools runs the command line of a call, one at a time, and answers
  its output" checks the same for exit code 2.
- **A server that a view call starts serves until the input ends, when rq-mcp
  closes it.** The step "runMcpServer closes the server of a view call once the
  input ends" starts view on port 0 and reads the URL from the answer. After the
  input ends and runMcpServer returns, a fetch to that URL is rejected, so the
  server was closed. The step does not fetch while the input is still open, so
  "serves until the input ends" is only shown by the server listening and
  reporting its URL. A fetch that succeeds before the input closes would make
  that part explicit.

Both gaps above are small and do not leave any statement uncovered. No file was
modified.

Verdict: every statement of R33 is covered by T30.

## Status

- Result: PASS
- Coverage: COMPLETE
