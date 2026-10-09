# R11 Agents and configuration

The commands that ask an agent take `--ai[=<agent>][:<model>]`, use the first of
`claude` and `copilot` installed without it, and `BOARD_AI_COMMAND` instead when
it is set; with none, they fail. Every command takes `--working-dir`, the board
folder, and runs the `markdownPostProcessing` command of the nearest
`board.json` on the documents it wrote.

## Implementation

- [T10 Command line][T10]

[T10]: <tests/T10 Command line.md>

## Coverage

T10 covers every statement of R11.

**The `--ai[=<agent>][:<model>]` option.** "board --ai runs the named agent with
the model" runs `plan` with `--ai=claude:fable` against a fake `claude` on PATH.
It checks that the agent got `--model fable`. "board works in --working-dir,
passes the guidance and --ai, and post-processes what it wrote" passes
`--ai=claude:fable` through `runCli`. "execExec runs the detected agent with its
model, allowed to edit files and run commands" covers the model when the agent
is detected.

**Using the first of `claude` and `copilot` that is installed.** "detectAgent
picks the first agent whose command runs, claude before copilot" checks this
directly. In "getCommand takes BOARD_AI_COMMAND, and fails without an agent", a
detected `copilot` is used when `--ai` is absent.

**`BOARD_AI_COMMAND` used instead when set.** The same `getCommand` step checks
that the override value is returned as the command when it is set. The cli tests
also drive the fake agent through this override.

**Failing when there is no agent.** The same `getCommand` step checks the
rejection "No AI agent found; install claude or copilot, or set
BOARD_AI_COMMAND."

**Every command takes `--working-dir`, the board folder.** The working-dir step
runs both `plan` and `list` with `--working-dir board` from the parent folder,
and both act on the board there.

**Post-processing with the nearest `board.json`.** In the same step,
`board.json` sits in the parent of the `--working-dir` folder, so it is found by
walking up, which is what "nearest" means. The step checks that
`markdownPostProcessing` ran exactly once, on the written file `board/Plans/P20
Restrict kids internet access.md`.

Two points are covered by examples rather than exhaustively. `--working-dir` is
shown on two commands, not all of them. `BOARD_AI_COMMAND` winning over
detection is only shown when no agent is detected. A stronger test would set
both the override and a detected agent and expect the override. Neither gap
leaves a statement uncovered.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
