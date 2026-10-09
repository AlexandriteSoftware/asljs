# Board

What a board is made of: its folders, the documents in them, and how their
status is read.

## Folders

A board is a folder - the working folder of the commands, the current directory
or `--working-dir`. Each kind of document has its folder, which is also its
column on the board:

| Folder     | Document                | What it is                     |
| ---------- | ----------------------- | ------------------------------ |
| `Ideas/`   | `I<n> <subject>.md`     | an idea                        |
| `Plans/`   | `P<n> <subject>.md`     | the plan of idea n             |
| `Tasks/`   | `T<n>-<m> <subject>.md` | task m of plan n               |
| `Results/` | `R<n>-<m> <subject>.md` | the result of task m of plan n |

`Archive/` holds what is done, `Archive/I<n> <subject>/` per idea with the same
four folders inside; the commands do not read it. Any other file or folder is
left alone, and so is a file whose name does not start with an id.

## Ids

`n` is the idea's number, and the plan, its tasks and their results share it:
`I19`, `P19`, `T19-1`, `T19-2`, `R19-1`. `m` numbers the tasks of a plan from 1,
in the order they are carried out.

Ids must be unique, and each document must be in its kind's folder: `board list`
and `board view` report a document that is not, and the commands do not see it.

Where a command takes a document, it takes an id, e.g. `T19-2`, a `.md` name,
e.g. `T19-2 Add a review date.md`, or a path relative to the board folder.

## Documents

Every document starts with a level 1 heading, `# <id> <subject>`; the subject is
the text after the id, or the file name's when there is no heading. Below it,
the text is free:

- an idea says what is wanted and why, and what is known;
- a plan has `## Goal`, `## Approach` and `## Steps`, a numbered list of
  concrete actions;
- a task says what to do, where, and how to know it is done;
- a result has a status line, a link to its task and the date, then the agent's
  report:

```markdown
# R19-2 Add a review date

- Status: DONE
- Task: [T19-2 Add a review date][T19-2]
- Date: 2026-10-09T10:00:00.000Z

Added `Reviewed:` to 3 articles.

[T19-2]: <../Tasks/T19-2 Add a review date.md>
```

The status is `DONE`, `FAILED` or `BLOCKED`, followed by the agent's note when
there is one.

## Open questions

What is not settled goes in a `## Open questions` section, one list item per
question. You answer with a nested item starting `Answer:`:

```markdown
## Open questions

- Which articles need reviews at all?
  - Answer: the ones under Legal Entities and Assets.
- Who prompts the review?
```

`board develop` folds the answered questions into the text and drops them, keeps
the open ones, and adds the questions the agent cannot settle. `board exec` adds
the questions of a blocked task to the task. A question without an answer counts
as open.

## Status

`board list` and `board view` show where each document stands:

| Document | Status                                    |
| -------- | ----------------------------------------- |
| idea     | `NEW`, or `PLANNED` once it has a plan    |
| plan     | `NEW`, or `TASKS` once it has tasks       |
| task     | `TODO`, or the status of its result       |
| result   | its status: `DONE`, `FAILED` or `BLOCKED` |

Next to the status, the number of open questions, when there are any.

## Configuration

`board.json` in the board folder or the nearest of its parents:

```json
{
  "markdownPostProcessing": "npx toolkit flint"
}
```

- `markdownPostProcessing` - a command line run after a command that wrote
  documents, with those files as arguments, relative to the folder of
  `board.json`, where it runs; for the project's own formatter. When it fails,
  `board` prints its output and exits with a non-zero code.
