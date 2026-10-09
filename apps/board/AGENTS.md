# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-board`.

This package keeps a planning board in markdown: ideas, plans, tasks and their
results, each a file in a folder of its kind, moved from one to the next by
commands that ask an AI agent. Its `skills/` tell an agent how to move items
between columns: `board-ideas.md` (Ideas to Plans), `board-plans.md` (Plans to
Tasks) and `board-tasks.md` (Tasks to Results, and the archive). Read the
matching skill before working on a board.

## AI Quick Reference

- the documents and ids are in `docs/Board.md`, the commands in
  `docs/Commands.md`
- the file name is the id and kind (`getItemId`): `I<n>`, `P<n>`, `T<n>-<m>`,
  `R<n>-<m>`, in `Ideas`, `Plans`, `Tasks`, `Results`; `Archive` is never read;
  a misplaced file or a duplicate id is a problem `loadBoard` reports and skips
- the agent never asks the user: what it cannot settle goes to `## Open
  questions`, answered with a nested `- Answer:` item (`questions.ts`)
- `develop`, `plan` and `tasks` run the agent read-only (`read` mode) and write
  the documents themselves from its answer; `toDocument` checks the heading;
  `exec` runs it in `edit` mode and writes the result whatever the verdict
- `exec` stops at the first task not done; a `Blocked` verdict's `questions` are
  added to the task
- the agent comes from `asljs-mdcli`: `--ai`, detection, `BOARD_AI_COMMAND`;
  tests set `Io.detectAgent` and use the fake agent of `testing/fixture.ts`
- markdown writes go through `writeMarkdown`; `runCli` post-processes them with
  `board.json` (`markdownPostProcessing`)
- code shared with `rq` belongs in `libs/mdcli`, not here
- `dev/rq/` holds the requirements of `board` and the tests that check them, run
  with `rq test .` and `rq coverage .` in that folder

## Source map

- `src/items.ts` - ids, kinds, folders; loading the board and finding items
- `src/questions.ts` - reading and adding open questions
- `src/ask.ts` - choosing and asking the agent, and the shared prompt text
- `src/develop.ts`, `src/plan.ts`, `src/tasks.ts`, `src/exec.ts`,
  `src/archive.ts`, `src/list.ts`, `src/view.ts` - the commands; `src/cli.ts`
  wires them (`createCli` builds the program, `runCli` runs it)
- `src/mcp.ts` - `board-mcp`: a tool per command of `createCli`, through
  `commandTools` of `asljs-mdcli`

## Tests

Tests build a board in a temporary folder with `src/testing/fixture.ts`, whose
`writeAgent` is a fake agent that answers by what the prompt contains and saves
each prompt; `src/testing/test-io.ts` captures output, fixes the clock and finds
no real agent.
