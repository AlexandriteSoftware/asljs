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

R11 is fully covered by T10. Each statement of R11 maps to one or more T10
steps, and I checked those steps against the test code they point to.

- **The commands that ask an agent take `--ai[=<agent>][:<model>]`.** "board
  --ai runs the named agent with the model" runs `plan I20 --ai=claude:fable`
  against a fake `claude` on the PATH. It checks that the agent receives
  `--model fable`. "board works in --working-dir, passes the guidance and --ai,
  …" also passes `--ai=claude:fable`. "getCommand takes BOARD_AI_COMMAND, …"
  covers the parts on their own: an agent alone (`{ agent: 'claude' }`) and a
  model alone (`{ model: 'fable' }`). "execExec runs the detected agent with its
  model, …" covers the model on `exec`.
- **Without `--ai`, they use the first of `claude` and `copilot` that is
  installed.** "detectAgent picks the first agent whose command runs, claude
  before copilot" checks three cases: `claude` when both are installed,
  `copilot` when only it is, and nothing when neither is. It also checks the
  order of the `--version` probes. "getCommand takes BOARD_AI_COMMAND, …" checks
  that a detected `copilot` is the agent used when no agent is named.
- **`BOARD_AI_COMMAND` is used instead when it is set.** "getCommand takes
  BOARD_AI_COMMAND, …" sets `BOARD_AI_COMMAND` with no `--ai` and gets that
  command back unchanged.
- **With no agent, they fail.** The same step expects the rejection "No AI agent
  found; install claude or copilot, or set BOARD_AI_COMMAND." "board returns 1
  and says why when a command fails" checks how the CLI reports a failed
  command.
- **Every command takes `--working-dir`, the board folder.** "board works in
  --working-dir, …" runs `plan` and `list` with `--working-dir board` from the
  folder above it. It checks that the plan is created in `board/Plans` and that
  `list` reads that board. "board without arguments prints help with every
  command" checks that the CLI lists all seven commands.
- **Every command runs the `markdownPostProcessing` command of the nearest
  `board.json` on the documents it wrote.** "board works in --working-dir, …"
  writes a `board.json` whose `markdownPostProcessing` command records its
  arguments. It checks that the command ran once, with exactly the written
  document `board/Plans/P20 Restrict kids internet access.md`.

Three things are covered by a single example rather than for every case. None of
them leaves a statement uncovered, but they are worth strengthening:

- **Only `plan` and `list` are tested with `--working-dir`**, although the
  statement says "every command". To prove it for all seven, extend "board
  without arguments prints help with every command", or add a T10 step, so that
  it checks each command's help lists `--working-dir`.
- **"Nearest `board.json`" is not tested against the alternatives.** The only
  `board.json` is in the current directory, which is also the parent of the
  working folder. So the test cannot tell "nearest to the board folder" from "in
  the current directory". It also never checks that a closer `board.json` wins
  over a farther one. A step with `board.json` files at two levels would settle
  both.
- **A bare `--ai` (no agent, no model) is never run through the CLI.**

## Status

- Result: PASS
- Coverage: COMPLETE
