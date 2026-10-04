# logging-apps-console-output-rule

Bring every application and tool in line with `docs/Logging.md`: silent by
default, `--loglevel` enables logging on the console, `--logfile` sends it to a
file instead, with the same environment variables everywhere.

Packages: `toolkit`, `part`, `kb`, `cog`.

## Current state

Verified by running each tool with stdout captured separately from stderr.

- `part` (`apps/part/src/cli.ts`) - already silent by default and takes both
  arguments; it is the model for the others. With `--loglevel` and no file it
  logs to stdout, as the rules allow: `part inventory --definitions aftefacts
  --loglevel trace` wrote 2,126 lines, of which 1,624 were log lines mixed into
  the inventory table. `--logfile` is the documented way to avoid that.
- `toolkit` (`apps/toolkit/src/lib/logger.ts`) - not silent: the builder starts
  at `information`. `clean`, `run-all`, `ensure-clean-working-directory`, the
  release commands and `flint` ("how many files each tool processes") report to
  the user through `logger.information`. Under the rules that is output, not
  logging: move those messages to direct stdout writes, then make the logger
  silent by default. `print-file` with `--loglevel trace` appends a `TRACE`
  line after the file content, which is allowed and avoided with `--logfile`.
- `kb` CLI (`apps/kb/src/cli.ts`, `apps/kb/src/logger.ts`) - the builder starts
  at `information`, so it is not silent by default in principle; in practice
  the commands write no log entries yet, so nothing appears even at `trace`.
  Make the default `silent` before the first log call is added.
- `kb` MCP server (`apps/kb/src/mcp/main.ts`) - silent unless `KB_LOG_FILE` is
  set, which is the MCP exception in the rules. Checked: with
  `KB_LOG_LEVEL=trace` and no file, stdout carries only JSON-RPC.
- `cog` CLI (`apps/cog/src/main/main.ts`, `apps/cog/src/logger.ts`) - the
  builder starts at `information`. cog only writes `debug` and `trace` entries,
  so it is quiet in practice; make the default `silent` so it is quiet by rule.
  If some of its progress is meant for the user, it moves to direct output, as
  for toolkit.
- `cog` MCP server (`apps/cog/src/mcp.ts`) - breaks the MCP exception: with
  `COG_LOG_LEVEL=debug` and no file, a `get-changed-files` call wrote two
  `DEBUG` lines to stdout between the JSON-RPC responses, corrupting the
  protocol. Until [mcp-server-transport][MCP] lands, do what `kb-mcp` does: log
  only when `COG_LOG_FILE` is set.

## Also

- Each application accepts both `--loglevel` and `--logfile` and both
  environment variables; `--logfile` alone enables logging at `information`.
- The application READMEs and requirements describe logging by pointing at
  `docs/Logging.md` instead of restating it. `apps/cog/README.md` gives `info`
  as an example level, which the options builder rejects; the name is
  `information`.
- [logging-shared-provider-factory][FAC] removes the per-application copies of
  this logic, so the default is stated once.

## Where

- `apps/toolkit/src/lib/logger.ts`, `apps/toolkit/src/toolkit.ts`,
  `apps/toolkit/src/commands/*.ts`, `apps/toolkit/src/lib/filesystem.ts`,
  `apps/toolkit/src/lib/repository.ts`
- `apps/kb/src/logger.ts`, `apps/kb/src/cli.ts`, `apps/kb/src/mcp/main.ts`
- `apps/cog/src/logger.ts`, `apps/cog/src/main/main.ts`, `apps/cog/src/mcp.ts`
- `apps/part/src/cli.ts`
- `apps/*/README.md`, `apps/*/docs/Requirements.md`

[FAC]: logging-shared-provider-factory.md
[MCP]: mcp-server-transport.md
