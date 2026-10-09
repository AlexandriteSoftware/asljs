# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-mdcli`.

This library holds the parts that `asljs-rq`, `asljs-board` and `asljs-kb`
share: asking an AI agent, markdown helpers, finding markdown files,
post-processing what a command wrote, the document server, and the MCP server
core. A part that a second tool needs moves here rather than being copied.

## AI Quick Reference

- the exports are in `docs/mdcli.md`
- nothing here knows a tool: the override variable (`RQ_AI_COMMAND`,
  `BOARD_AI_COMMAND`) and the configuration file name (`rq.json`, `board.json`)
  are parameters
- agent modes: `read`, `run`, `edit`; the command lines are in `AGENT_COMMANDS`
  of `src/agent.ts`
- a verdict is the last JSON line with `result` `OK`, `Fail` or `Blocked`;
  `answer` is what came before it
- `writeMarkdown` remembers files in a module-level set, emptied by
  `takeWritten`; a tool calls `takeWritten` before and after a command
- a function that runs something takes an optional `Logger` and defaults to a
  `NullLogger`; the tool creates the provider, never this package
  (`docs/Logging.md` at the repository root)
- the tools consume this package through its `dist`: run `npm -w asljs-mdcli run
  build:dist` after a change, before building them

## Source map

- `src/agent.ts` - agent specs, detection, command lines, asking for a verdict
- `src/markdown.ts` - mdast helpers
- `src/files.ts` - finding markdown files
- `src/post-process.ts` - remembering written files and post-processing them
- `src/run-command.ts` - running commands and programs
- `src/server.ts` - the document server
- `src/mcp.ts` - the MCP server core shared with `kb`: JSON-RPC handling over
  lines, the schema builders, and `commandTools`, a tool per command of a
  commander program
