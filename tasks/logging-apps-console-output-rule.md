# logging-apps-console-output-rule

Bring the applications in line with the output rule in
[logging-json-console-output][OUT]: a tool whose stdout is its output never
logs to the console.

Packages: `toolkit`, `part`, `kb`, `cog`.

Depends on [logging-json-console-output][OUT], which adds the choice between
console and file-only logging.

Current state:

- `kb` MCP server (`apps/kb/src/mcp/main.ts`) - already follows the rule:
  `logLevel()` keeps logging silent unless `KB_LOG_FILE` is set. Move it to the
  file-only output so the rule is stated once, in the provider.
- `kb` CLI (`apps/kb/src/cli.ts`) - command output goes to stdout; a raised
  level would put pretty log lines into it.
- `part` (`apps/part/src/cli.ts`) - silent by default, but `--loglevel` without
  `--logfile` logs pretty output to stdout, into the command's output.
- `toolkit` (`apps/toolkit/src/lib/logger.ts`) - the builder starts at
  `information` and logs to stdout. `print-file` exists to write a file to
  stdout, and `flint` prints its own report.
- `cog` MCP server (`apps/cog/src/mcp.ts`) - calls `createLoggerProvider()`
  with no options, so it logs at `information` to stdout, the stdio protocol
  channel. Check whether anything is written at that level while serving; if so
  it corrupts the protocol today.
- `cog` CLI (`apps/cog/src/main/main.ts`) - unclear. Progress lines on the
  console may be the expected experience of an automation runner, in which case
  it is a console application under the rule; if its stdout carries task
  results, it is file-only.

For each, decide console or file-only, state it where the provider is built,
and record it in the package's docs next to the `<APP>_LOG_*` variables.

## Where

- `apps/kb/src/mcp/main.ts`, `apps/kb/src/cli.ts`, `apps/kb/src/logger.ts`
- `apps/part/src/cli.ts`
- `apps/toolkit/src/lib/logger.ts`, `apps/toolkit/src/toolkit.ts`
- `apps/cog/src/mcp.ts`, `apps/cog/src/main/main.ts`, `apps/cog/src/logger.ts`

[OUT]: logging-json-console-output.md
