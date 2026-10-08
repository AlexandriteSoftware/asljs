# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-rq`.

This package manages requirements written in markdown: it queries and changes
the graph of requirements and evidence through commands, checks and verifies it,
runs the evidence steps, and serves the graph and the documents in a browser.
Its `skills/` tell an AI agent how to write and update requirements.

## AI Quick Reference

- the formats are in `docs/Requirements.md`; the commands in `docs/Querying the
  graph.md`, `docs/Changing the graph.md`, `docs/rq check.md`, `docs/rq
  verify.md` and `docs/rq view.md`
- text (statements, descriptions, steps) is edited directly; structure (links,
  `## Implementation` items, `## Log` entries, files) only through the commands
- the file name is the kind (`getNodeKind`): `RQ<n> <name>.md` a requirement,
  `EV<n> <name>.md` an evidence; any other document is not a node and is ignored
  by the graph, though `remove` and `move` still fix links in it
- edges are only the links in a requirement's `## Implementation` list,
  reference links included (`RqDocument.implementation`); `links` holds every
  local `.md` link, for rewriting
- a file path is the only root; a folder's roots are the requirements no other
  requirement links to, and there may be several
- the diagram is `graph LR`
- the change commands only write links into `## Implementation`, but remove and
  rewrite links anywhere; `remove`, `move`, `backlinks` and the id of `add` look
  at every `.md` file under `--in`, the working directory by default
- `link` refuses a link from an evidence, a duplicate, and a cycle
- `rq verify` writes: it appends a `## Log` entry to every evidence it runs
- steps run with `shell: true` in the evidence's folder, one line per command
- `--ai` uses the same agent commands as `part check --ai`; `RQ_AI_COMMAND`
  replaces them
- `rq view` reloads the graph on every request for `/` and serves only files
  inside the folder

## Source map

- `src/markdown.ts` - mdast helpers: sections, plain text, local link targets
- `src/document.ts` - parses a document; reads and formats log entries
- `src/edit.ts` - structural text edits by mdast positions: list items, link
  removal and rewriting, the heading
- `src/scope.ts` - the documents of a folder: backlinks, referrers, next id
- `src/query.ts` - `list`, `links`, `backlinks`, `tojson`
- `src/change.ts` - `add`, `link`, `unlink`, `remove`, `move`, `log`
- `src/check.ts` - `check`
- `src/graph.ts` - finds the roots, walks the links, reports structure errors
- `src/evidence.ts` - runs the steps and logs the run
- `src/coverage.ts` - the AI coverage check
- `src/verify.ts`, `src/view.ts` - the commands; `src/cli.ts` wires them
- `src/mermaid.ts` - the diagram of the graph

## Tests

Tests build requirements in a temporary folder with `src/testing/fixture.ts`,
and capture output and fix the clock with `src/testing/test-io.ts`. The AI check
is tested with a fake agent through `RQ_AI_COMMAND`, and the view with a server
on port 0.
