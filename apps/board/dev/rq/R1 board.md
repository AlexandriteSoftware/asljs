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
- [T10 Command line][T10]

[R2]: <model/R2 Board model.md>
[R4]: <commands/R4 Moving documents.md>
[R11]: <R11 Agents and configuration.md>
[T10]: <tests/T10 Command line.md>

## Coverage

R1 makes five statements. Each one is covered by a linked requirement or by T10.

1. "`board` keeps a planning board in markdown: ideas become plans, plans become
   tasks." R2 covers this. It defines the board as a folder of markdown
   documents with one folder per stage (`Ideas/I<n>`, `Plans/P<n>`,
   `Tasks/T<n>-<m>`, `Results/R<n>-<m>`), and the plan, tasks and results of
   idea n share its number. R4 covers the progression from one column to the
   next: `plan` and `tasks` write the documents of the next column.

2. "An AI agent elaborates each of them and carries the tasks out, with the
   results written next to them." R4 covers this. `develop` elaborates a
   document within its column, `plan`, `tasks` and `exec` ask an AI agent, and
   `exec` writes the next column's documents, which are the Results. R2 puts
   those Results beside the Tasks on the board. R11 covers how the agent is
   chosen and invoked, and T10 checks the `--ai` handling, agent detection and
   `BOARD_AI_COMMAND`.

3. "Every operation is a subcommand of `board`." R4 lists the operations as the
   subcommands `plan`, `tasks`, `exec`, `develop`, `archive`, `list` and `view`.
   T10's step "board without arguments prints help with every command" checks
   that each of them is offered as a subcommand.

4. "`board` without arguments prints help listing them." T10's step "board
   without arguments prints help with every command" covers this.

5. "A command that fails exits with a non-zero code and says why." T10's step
   "board returns 1 and says why when a command fails" covers this. T10's step
   "getCommand takes BOARD_AI_COMMAND, and fails without an agent" adds a
   specific failure case.

R1 is fully covered by R2, R4, R11 and T10, so nothing needs to be added or
changed.

## Status

- Result: PASS
- Coverage: COMPLETE
