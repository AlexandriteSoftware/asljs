# R1 board

`board` keeps a planning board in markdown: ideas become plans, plans become
tasks, and an AI agent elaborates each of them and carries the tasks out, with
the results written next to them. Every operation is a subcommand of `board`;
`board` without arguments prints help listing them, and a command that fails
exits with a non-zero code and says why.

## Implementation

- [R2 Board model][R2]
- [R4 Moving documents][R4]
- [R11 Agents and configuration][R11]
- [R14 MCP server][R14]
- [T10 Command line][T10]

[R2]: <model/R2 Board model.md>
[R4]: <commands/R4 Moving documents.md>
[R11]: <R11 Agents and configuration.md>
[R14]: <R14 MCP server.md>
[T10]: <tests/T10 Command line.md>

## Coverage

R1 makes five statements. Each one is covered by at least one requirement or
test it links to.

- **A planning board kept in markdown.** R2 covers this. It defines the board as
  a folder of markdown documents, with one folder per stage: `Ideas`, `Plans`,
  `Tasks`, `Results` and `Archive`.
- **Ideas become plans, and plans become tasks.** R4 covers this through the
  `plan` and `tasks` commands, which write the next column's documents. R2 adds
  that a plan and its tasks share the idea's number.
- **An AI agent elaborates each document, carries the tasks out, and writes the
  results next to them.** R4 covers this. `develop` elaborates a document in its
  own column. `exec` carries the tasks out and writes the `Results` documents,
  which R2 places in the `Results` column under the same numbers. R11 covers how
  the agent is chosen and run.
- **Every operation is a subcommand of `board`.** R4 lists the operations as the
  commands `develop`, `plan`, `tasks`, `exec`, `archive`, `list` and `view`. R11
  gives the options every command takes. T10's step "board without arguments
  prints help with every command" checks that they are all `board` subcommands.
- **`board` without arguments prints help listing the subcommands.** T10's step
  "board without arguments prints help with every command" covers this.
- **A failing command exits with a non-zero code and says why.** T10's step
  "board returns 1 and says why when a command fails" covers this.

One link goes beyond the statement. R1 links to R14 (the `board-mcp` server),
but its text never mentions an MCP server. This is not a coverage gap. To keep
the requirement and its links aligned, the maintainers could add a sentence to
R1's statement, for example: "`board-mcp` serves the same commands as MCP
tools."

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
