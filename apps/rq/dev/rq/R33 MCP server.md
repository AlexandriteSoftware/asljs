# R33 MCP server

rq-mcp is an MCP server over standard input and output with a tool per rq
command, subcommands joined with _, whose arguments are the command's arguments
and options by name. A call runs that command line, one at a time, in the
server's folder or its workingDir, and answers what it printed; a non-zero exit
code makes it an error result.

## Implementation

- [T30 MCP server][T30]

[T30]: <tests/T30 MCP server.md>

## Coverage

R33 is fully covered by T30, its only linked node. Each statement of R33 has a
T30 step that checks it:

- **MCP server over standard input and output.** The step "serveLines answers
  line-delimited requests and reports invalid lines" reads requests line by line
  from an input stream and writes one answer line for each. The step "rq-mcp
  runs the commands in their working folder, and reports failures as errors"
  sends requests to `runMcpServer` the same way and reads its output lines. The
  step "handleMessage answers initialize, tools/list, unknown methods and
  notifications" covers the protocol itself. The step "serverInfo names the
  server and the package version" covers how the server identifies itself.
- **A tool per rq command, subcommands joined with `_`.** The step "createTools
  makes a tool of every rq command" checks the full list of tool names,
  including `add_requirement` and `add_test`. The step "commandTools makes a
  tool per command, with its arguments and options" checks that `add test`
  becomes `add_test` and that a skipped command gets no tool.
- **Arguments are the command's arguments and options, by name.** The step
  "createTools makes a tool of every rq command" checks that the `test` tool's
  properties are `targets`, `recurse`, `name`, `ai` and `workingDir`, and that
  `targets` is required. The step "commandTools makes a tool per command, with
  its arguments and options" checks the types, descriptions and required lists
  built from arguments and options.
- **A call runs that command line, one at a time.** The step "commandTools runs
  the command line of a call, one at a time, and answers its output" checks the
  exact command line built from a call, including the `--` separator. It also
  starts two calls at once and checks that only one runs at a time. It rejects a
  call with a missing or unknown argument.
- **In the server's folder or its workingDir.** The step "rq-mcp runs the
  commands in their working folder, and reports failures as errors" runs `check`
  and `test` with `workingDir: 'reqs'`, resolved against the server's folder,
  and gets the result for that subfolder. The default case, with no
  `workingDir`, is only checked indirectly through how `workingDir` is resolved
  against the server's folder. That is enough to call it covered, but a call
  without `workingDir` would make it explicit.
- **Answers what it printed.** The step "commandTools runs the command line of a
  call, one at a time, and answers its output" checks that a call returns the
  command's output as text. The step "rq-mcp runs the commands in their working
  folder, and reports failures as errors" checks the actual text `check` prints.
  The step "tools/call sends a result as JSON, text as it is, and a failure as
  an error result" checks how results are encoded.
- **A non-zero exit code makes it an error result.** The step "commandTools runs
  the command line of a call, one at a time, and answers its output" checks that
  exit code 2 gives an error result ending in `Exit code: 2`. The step "rq-mcp
  runs the commands in their working folder, and reports failures as errors"
  checks that a failing `rq test` gives an error result ending in `Exit code:
  1`. The step "tools/call sends a result as JSON, text as it is, and a failure
  as an error result" covers how errors are encoded on the protocol side.

Verdict: every statement of R33 is covered by T30. I did not modify any file.

## Status

- Result: PASS
- Coverage: COMPLETE
