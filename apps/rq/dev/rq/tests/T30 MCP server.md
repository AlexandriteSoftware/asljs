# T30 MCP server

The tools of rq-mcp, and a call through it.

## Steps

### createTools makes a tool of every rq command

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: createTools makes a tool of every rq command

### rq-mcp runs the commands in their working folder, and reports failures as errors

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: rq-mcp runs the commands in their working folder, and reports failures
  as errors

### runMcpServer closes the server of a view call once the input ends

- Type: javascript
- File: ../../../build/mcp.test.js
- Test: runMcpServer closes the server of a view call once the input ends

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

### serveLines answers line-delimited requests and logs requests and invalid lines

- Type: javascript
- File: ../../../../../libs/mdcli/build/mcp.test.js
- Test: serveLines answers line-delimited requests and logs requests and invalid
  lines

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

- Result: PASS - 9 steps
- Execution: [E19 T30 T31][E19]

[E19]: <../.rq/E19 T30 T31.md>
