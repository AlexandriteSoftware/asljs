# T11 MCP server

The tools of board-mcp, and calls through it.

## Steps

### createTools makes a tool of every board command

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: createTools makes a tool of every board command

### board-mcp runs the commands with the agent in their working folder, and reports failures as errors

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: board-mcp runs the commands with the agent in their working folder, and
  reports failures as errors

### serverInfo names the server and the package version

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: serverInfo names the server and the package version

### handleMessage answers initialize, tools/list, unknown methods and notifications

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: handleMessage answers initialize, tools/list, unknown methods and
  notifications

### tools/call sends a result as JSON, text as it is, and a failure as an error result

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: tools/call sends a result as JSON, text as it is, and a failure as an
  error result

### serveLines answers line-delimited requests and reports invalid lines

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: serveLines answers line-delimited requests and reports invalid lines

### commandTools makes a tool per command, with its arguments and options

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: commandTools makes a tool per command, with its arguments and options

### commandTools runs the command line of a call, one at a time, and answers its output

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: commandTools runs the command line of a call, one at a time, and answers
  its output

## Status

- Result: PASS - 8 steps
- Execution: [E7 rq][E7]

[E7]: <../.rq/E7 rq.md>
