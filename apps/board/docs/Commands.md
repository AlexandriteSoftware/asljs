# Commands

The `board` commands, which move documents from one column to the next. Every
command takes `--working-dir <folder>`, the board folder, the current directory
by default; see [Board][BD] for the documents and their ids.

The commands that ask an AI agent - `develop`, `plan`, `tasks` and `exec` - take
`--ai[=<agent>][:<model>]`: the agent, `claude` or `copilot`, and its model,
both optional, e.g. `--ai=claude:fable`. Without it they use the first of
`claude` and `copilot` that is installed; `BOARD_AI_COMMAND` replaces the
agent's command line, which gets the prompt on standard input. No agent is an
error.

A command prints the files it created or changed, and exits with a non-zero code
when it fails.

## board develop

```text
board develop <item> [guidance] [--ai[=<agent>][:<model>]]
```

Elaborates an idea, plan or task: the agent reads it, the documents it belongs
with - a plan's idea, a task's plan and idea - and your answers to its open
questions, and rewrites it, keeping its heading. An idea becomes something that
can be planned, a plan something that can be broken into tasks, a task something
one person or agent can carry out and check. `guidance` is what you want from
it, e.g. `"add user specific goals"`.

```text
Developed Ideas/I19 Track how fresh articles are.md - 2 open questions
```

The agent may read files to find facts, and changes only the document. A result
is not developed; develop its task.

## board plan

```text
board plan <idea> [guidance] [--ai[=<agent>][:<model>]]
```

Writes `Plans/P<n> <subject>.md`, the plan of the idea, with the idea's subject:
`## Goal`, `## Approach`, `## Steps` and the `## Open questions` the plan needs.
An idea with a plan is refused; develop the plan instead. The idea's open
questions are reported, not required to be answered.

## board tasks

```text
board tasks <plan> [--ai[=<agent>][:<model>]]
```

Breaks the plan into tasks, `Tasks/T<n>-<m> <subject>.md` from 1, in the order
they are to be carried out, each with the `## Open questions` the agent could
not settle. A plan with tasks is refused; develop the tasks instead.

## board exec

```text
board exec <plan> [--ai[=<agent>][:<model>]]
```

Carries out the plan's tasks one by one, in order. For each, the agent - which
may read and edit files and run commands, in the board folder - does what the
task says, and its report becomes `Results/R<n>-<m> <subject>.md`:

```text
DONE     Tasks/T19-1 Choose the articles.md - earlier
DONE     Tasks/T19-2 Add a review date.md
Result   Results/R19-2 Add a review date.md
BLOCKED  Tasks/T19-3 Report the articles.md - Which folder?
Result   Results/R19-3 Report the articles.md
Updated  Tasks/T19-3 Report the articles.md - answer its open questions, then run board exec P19 again
```

- A task whose result is `DONE` is skipped.
- It stops at the first task that is not done: `FAILED`, when it went wrong, or
  `BLOCKED`, when the agent needs something only you can give - a decision, a
  password, an action on a web site. The questions of a blocked task are added
  to its `## Open questions`.
- Run it again after answering or fixing: it carries on from that task, with the
  last attempt's result for context.

It exits with 0 only when every task is done.

## board archive

```text
board archive <item>
```

Moves the idea and everything with its number - plan, tasks, results - to
`Archive/I<n> <subject>/`, each in a folder of its kind. Any document of the
idea names it. An archive folder that exists is an error.

## board list

```text
board list [--json]
```

The documents, column by column, with their status and open questions; with
`--json`, an object with an array per kind - `idea`, `plan`, `task`, `result` -
of `{ id, kind, subject, path, status, openQuestions }`. Documents in the wrong
folder, and ids used twice, are reported on standard error.

## board view

```text
board view [--port <port>]
```

Serves the board on `127.0.0.1`: `/` is a column each for Ideas, Plans, Tasks
and Results, one card per document with its status and open questions, read
again on every request; a card opens its document, rendered. Without `--port` it
takes the first free port from 3000 on; with it, exactly that port, and 0 any
free one.

[BD]: Board.md
