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

## Coverage

R1 is fully covered. It makes six statements, and each one is covered by at
least one linked requirement or test:

- **"`rq` manages requirements written in markdown: it keeps a graph of
  requirements and the tests that check them."** R2 Requirements model defines
  the graph: which documents are nodes and which links are edges, covering
  requirements, tests and statuses. R24 Structural commands covers reading and
  changing that graph through commands that keep links valid.
- **"[It] runs the tests."** R7 Test documents covers what a test's steps are
  and how they run. R13 Running tests covers `rq test` running the tests of its
  targets.
- **"[It] records their results."** R13 Running tests covers this through its
  sub-requirements R15 Execution files, R16 Status recalculation and R17 Manual
  results.
- **"[It] checks with an AI agent that the requirements are covered."** R18
  Coverage check covers `rq coverage`. R19 AI agents covers how the agent is
  chosen.
- **"[It] shows the graph."** R20 Diagram covers `rq view` serving the graph as
  a diagram and the documents as HTML.
- **"Every command is a subcommand of `rq`; `rq` without arguments prints help
  listing the commands."**
  - T22 Command line covers this with its step "rq without arguments prints
    help". The step checks that the exit code is 0, that the output contains
    `Usage: rq`, and that it lists the `test` and `view` commands.
  - T23 Command documentation also runs `rq` with no arguments and checks that
    every command it lists is documented.
- **"Every command returns a non-zero exit code when it fails."** T22 covers
  this with its step "every command returns 1 when it fails". It runs every
  command (`check`, `list`, `links`, `backlinks`, `tojson`, `add`, `link`,
  `unlink`, `remove`, `move`, `log`, `test`, `coverage`, `view`) with a failing
  argument. It checks that each returns 1 and writes to stderr.

R28 Working folder adds a shared rule for all commands: which folder they work
in and how they find documents. T23 checks that every command has documentation.
Neither is required by a statement of R1, but both fit under it as the
application's own requirement.

There is one minor weakness, and it is not a gap. The help test checks only some
commands by name (`test` and `view`), not that every command is listed. To make
"prints help listing the commands" airtight, T22's help step could check for
every subcommand name.

## Status

- Result: PASS
- Coverage: COMPLETE
