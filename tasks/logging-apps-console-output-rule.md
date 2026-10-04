# logging-apps-console-output-rule

Bring the applications in line with the output rule in
[logging-json-console-output][OUT]: a tool whose stdout is its output never
logs to the console.

Packages: `toolkit`, `part`, `kb`, `cog`.

Depends on [logging-json-console-output][OUT], which adds the choice between
console and file-only logging.

Current state, verified by running each tool with stdout captured separately
from stderr:

- `kb` MCP server (`apps/kb/src/mcp/main.ts`) - follows the rule. With
  `KB_LOG_LEVEL=trace` and no file, stdout carries only JSON-RPC; with
  `KB_LOG_FILE` the entries go to the file. `logLevel()` forces `silent` unless
  `KB_LOG_FILE` is set. Move this to the file-only output so the rule is stated
  once, in the provider.
- `kb` CLI (`apps/kb/src/cli.ts`) - no log lines on stdout even at `--loglevel
  trace`, because the commands write no log entries today. The risk is latent:
  the first log call added to a command would land in its output, including
  `--format json`.
- `part` (`apps/part/src/cli.ts`) - silent by default. `part inventory
  --definitions aftefacts --loglevel trace` wrote 2,126 lines to stdout, of
  which 1,624 were log lines mixed into the inventory table.
- `toolkit` (`apps/toolkit/src/lib/logger.ts`) - two kinds of command:
  - `print-file` writes data: with `--loglevel trace` or `TOOLKIT_LOG_LEVEL`,
    a `TRACE` line follows the file content on stdout.
  - `clean`, `run-all`, `ensure-clean-working-directory` and the release
    commands report progress through `logger.information`, which the default
    level shows. That is the console experience of those commands, so toolkit
    is a console application whose data commands are the exception.
- `cog` MCP server (`apps/cog/src/mcp.ts`) - at the default level it is clean,
  because cog only logs at `debug` and `trace`. With `COG_LOG_LEVEL=debug` and
  no file, a `get-changed-files` call wrote two `DEBUG` lines to stdout between
  the JSON-RPC responses, which corrupts the stdio protocol. With `COG_LOG_FILE`
  set, they go to the file and stdout stays clean.
- `cog` CLI (`apps/cog/src/main/main.ts`) - not tested. Progress lines on the
  console may be the expected experience of an automation runner, in which case
  it is a console application under the rule; if its stdout carries task
  results, it is file-only.

`pino-pretty` is configured with `colorize: true`, so the console lines carry
ANSI colour codes even when stdout is a pipe or a file (seen in `toolkit clean`
output captured to a file). The automatic format in
[logging-json-console-output][OUT] removes that: no terminal means JSON.

For each, decide console or file-only, state it where the provider is built,
and record it in the package's docs next to the `<APP>_LOG_*` variables.

## Where

- `apps/kb/src/mcp/main.ts`, `apps/kb/src/cli.ts`, `apps/kb/src/logger.ts`
- `apps/part/src/cli.ts`
- `apps/toolkit/src/lib/logger.ts`, `apps/toolkit/src/toolkit.ts`
- `apps/cog/src/mcp.ts`, `apps/cog/src/main/main.ts`, `apps/cog/src/logger.ts`

[OUT]: logging-json-console-output.md
