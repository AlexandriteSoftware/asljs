# board

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries and tools for everyday use.

A planning board kept as markdown files: ideas become plans, plans become tasks,
and an AI agent helps at every step and carries the tasks out.

## Overview

A board is a folder with a column per stage:

- `Ideas/I<n> <subject>.md` - something worth doing, as you wrote it;
- `Plans/P<n> <subject>.md` - the plan of idea n: the goal, the approach, the
  steps;
- `Tasks/T<n>-<m> <subject>.md` - task m of plan n, something one person or
  agent can do and check;
- `Results/R<n>-<m> <subject>.md` - what happened when task m was carried out;
- `Archive/I<n> <subject>/` - an idea and everything that came of it, once it is
  done.

Each step is a command, and each command but `archive`, `list` and `view` asks
an AI agent, `claude` or `copilot`:

- `board develop <item> [guidance]` elaborates an idea, plan or task;
- `board plan I<n>` writes the plan of an idea;
- `board tasks P<n>` breaks a plan into tasks;
- `board exec P<n>` carries the tasks out one by one and writes their results;
- `board archive I<n>` moves an idea and what came of it to the archive;
- `board list` and `board view` show the board, the second as a web page with a
  column per stage.

The agent never asks you anything directly. What it cannot settle it writes to
the document's `## Open questions`; you answer there, under the question, and
run the command again.

## Scope

- Documents are plain markdown, edited by you and the agent alike; ids and
  folders are the whole structure.
- The agent may read files to develop, plan and break into tasks, and changes
  only the document the command writes. To carry out tasks it may also edit
  files and run commands, so run `board exec` on a board you trust.
- `board.json` in the board folder or a parent can name a formatter to run on
  what `board` writes.

## Installation

```bash
npm install asljs-board
```

`board develop`, `plan`, `tasks` and `exec` need an AI agent installed: Claude
Code (`claude`) or GitHub Copilot CLI (`copilot`).

## Usage

```bash
cd Tasks
board develop I19 "add user specific goals"
board plan I19
board develop P19
board tasks P19
board exec P19
board archive I19
board view
```

A question the agent leaves, and your answer:

```markdown
## Open questions

- Which articles need reviews at all?
  - Answer: the ones under Legal Entities and Assets.
```

## Further reading

- [Board][BD] - the documents, ids, open questions and statuses.
- [Commands][CM] - every command and its options.
- [Skills][SK] - how an AI agent moves items from one column to the next.

## Related packages

- `asljs-rq` manages requirements in markdown the same way, as a graph.
- `asljs-mdcli` holds the parts the two share.

## License

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
[BD]: docs/Board.md
[CM]: docs/Commands.md
[SK]: skills
