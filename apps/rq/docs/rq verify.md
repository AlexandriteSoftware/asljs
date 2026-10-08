# rq verify

Verifies a requirement and everything it is implemented by. It exits with a
non-zero code when anything fails.

```text
rq verify <path> [--ai [claude|copilot]]
```

`<path>` is a requirement file or a folder, relative to the working directory;
see [Requirements][RM] for how the root is found.

For each node, from the root down:

- an evidence: its steps are run and the run is appended to its `## Log`. It
  passes when every step exits with code 0;
- a requirement: it fails when it links to nothing, when a node it links to
  fails, or, with `--ai`, when the agent finds a statement nothing covers.

```text
Fail  RQ1 Export.md - 1 of 2 links failed
OK    RQ2 CSV export.md
OK    evidence/EV1 PDF export.md - 1 step
Fail  evidence/EV2 CSV export.md - step 1 exited with code 1: 1 test failed
Error  RQ2 CSV export.md: the link to RQ3.md points at no file.
```

One line per node, in breadth-first order from the root, then one `Error` line
per structure error. A node is run once, however many requirements link to it.

## Options

- `--ai [agent]` - for each requirement that links to something, ask an AI agent
  whether those nodes fully cover its statements. `claude` (default) runs
  `claude -p --allowedTools Read,Grep,Glob`; `copilot` runs `copilot` with
  writing and shell tools denied. `RQ_AI_COMMAND` replaces the command. The
  command runs in the graph's folder with the prompt on standard input, and its
  verdict is the last line of output that is `{"result":"OK"}` or
  `{"result":"Fail","message":"..."}`.

[RM]: Requirements.md
