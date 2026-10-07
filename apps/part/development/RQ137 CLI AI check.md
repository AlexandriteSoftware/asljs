# RQ137 CLI AI check

`check --ai` checks rules that no plugin implements with an AI agent. Without
`--ai`, such rules are `Skip`. Rules with an implementation always run as code.

- `--ai` or `--ai=claude` - Claude: `claude -p --allowedTools Read,Grep,Glob`.
- `--ai=copilot` - Copilot: `copilot -s --no-ask-user --allow-all-tools
  --deny-tool=write --deny-tool=shell`.
- Any other agent name is an error.
- `PART_AI_COMMAND` replaces the agent command.

The command runs in the project root with the prompt on standard input. The
agent may read the project but not change it. The prompt holds the definition
name and description, the rule id and text, the artefact location, and the
absolute path of a `file:` artefact.

The agent answers with one line of JSON: `{"result":"OK","message":""}` or
`{"result":"Fail","message":"..."}`. The last such line of the output is the
verdict. A run that exits with a non-zero code, or output without a verdict, is
a failure with the reason as the message.

Agents run one at a time. AI results are cached like code results, see
[RQ136][RQ136]. In the report, the result of an AI check ends with ` (AI)`, e.g.
`OK (AI)`.

[RQ136]: <RQ136 CLI Check cache.md>
