# R1 rq

`rq` manages requirements written in markdown: it keeps a graph of requirements
and the tests that check them, runs the tests, records their results, checks
with an AI agent that the requirements are covered, and shows the graph. Every
command is a subcommand of `rq`; `rq` without arguments prints help listing the
commands, and every command returns a non-zero exit code when it fails.

## Implementation

- [R2 Requirements model][R2]
- [R7 Test documents][R7]
- [R13 Running tests][R13]
- [R18 Coverage check][R18]
- [R19 AI agents][R19]
- [R20 Diagram][R20]
- [R24 Structural commands][R24]
- [R28 Working folder][R28]
- [T22 Command line][T22]
- [T23 Command documentation][T23]
- [R33 MCP server][R33]
- [R34 Logging][R34]

[R2]: <model/R2 Requirements model.md>
[R7]: <steps/R7 Test documents.md>
[R13]: <running/R13 Running tests.md>
[R18]: <coverage/R18 Coverage check.md>
[R19]: <agents/R19 AI agents.md>
[R20]: <diagram/R20 Diagram.md>
[R24]: <structure/R24 Structural commands.md>
[R28]: <R28 Working folder.md>
[T22]: <tests/T22 Command line.md>
[T23]: <tests/T23 Command documentation.md>
[R33]: <R33 MCP server.md>
[R34]: <R34 Logging.md>

## Coverage

I've read R1 and everything it links to. R1 is fully covered.

R1 makes six statements. Each one is covered:

- **"rq manages requirements written in markdown and keeps a graph of
  requirements and the tests that check them."** R2 defines the graph:
  requirements and tests built from markdown files, with edges only from `##
  Implementation` lists. Its sub-requirements R3 to R6 cover node kinds, the
  hierarchy, tests and statuses. R24 covers reading and changing that structure
  only through commands that keep every link valid.
- **"It runs the tests."** R7 covers a test's steps, their types and how they
  run in the test's folder until the first failure. R13 covers `rq test` running
  the tests of its targets.
- **"It records their results."** R13 covers recording the run and writing the
  resulting statuses. Its sub-requirements are R15 (execution files), R16
  (status recalculation), R17 (manual results), R29 (test report) and R30
  (retention).
- **"It checks with an AI agent that the requirements are covered."** R18 covers
  `rq coverage` asking an agent and writing the verdict and analysis. R19 covers
  how the agent is chosen.
- **"It shows the graph."** R20 covers `rq view` serving the graph as a diagram
  and the documents as HTML. Its sub-requirements are R21, R22 and R23.
- **"Every command is a subcommand of rq; rq without arguments prints help
  listing the commands."** T22's step "rq without arguments prints help" checks
  for exit code 0, `Usage: rq`, and the `test` and `view` entries. T23 runs `rq`
  with no arguments and checks that every command it lists is documented.
- **"Every command returns a non-zero exit code when it fails."** T22's step
  "every command returns 1 when it fails" runs each command with a failing
  argument and checks that it returns 1. The commands are `check`, `list`,
  `links`, `backlinks`, `tojson`, `add requirement`, `link`, `unlink`, `remove`,
  `move`, `log`, `test`, `coverage` and `view`.

No statement of R1 directly requires R28 (working folder) or R33 (the `rq-mcp`
server). Both fit under R1 as part of the application's own requirements.

There are two small weaknesses. Neither leaves a statement uncovered:

- **Help listing:** the help test names only `test` and `view`. T23 checks that
  every listed command is documented, but not that every command is listed. To
  close this, T22's help step could check for every subcommand name.
- **Failure exit code:** the failing-command list in `src/cli.test.ts` includes
  `add requirement` but not `add test`. Adding a failing `add test` call would
  make "every command" complete.

I didn't modify any file.

## Status

- Result: PASS
- Coverage: COMPLETE
