# AI agents

How an AI agent is chosen and asked.

- The agent code is in `asljs-mdcli` (`libs/mdcli`), shared with `board`.
- `getAgentCommand` picks `RQ_AI_COMMAND`, else the agent `--ai` names, else the
  first of `claude` and `copilot` whose `--version` runs (`detectAgent`). Tests
  replace detection with `Io.detectAgent`, so no real agent runs.
- Two permission modes: `read` - read and search files - for `rq coverage`;
  `run` - also run commands, no edits - for instruction steps.
- The prompt goes on standard input; the verdict is the last line of output that
  is `{"result":"OK"}` or `{"result":"Fail","message":"..."}` (`askAgent`).
  Anything else is a failure with the output quoted. What the agent wrote before
  the verdict is its `answer`; `rq coverage` writes it to `## Coverage`
  (`writeCoverageSection`), escaping headings so the section cannot be split.
