# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-rq`.

This package manages requirements written in markdown: it queries and changes
the graph of requirements and tests through commands, checks and verifies it,
runs the test steps, and serves the graph and the documents in a browser. Its
`skills/` tell an AI agent how to write and update requirements, and how to
close the coverage gaps `rq coverage` reports: `requirements-authoring.md`,
`requirements-change.md` and `requirements-coverage.md`. Read the matching skill
before working on requirements, here or in `dev/rq`.

## AI Quick Reference

- the formats are in `docs/Requirements.md`; the commands in `docs/Querying the
  graph.md`, `docs/Changing the graph.md`, `docs/rq check.md`, `docs/rq
  test.md`, `docs/rq coverage.md` and `docs/rq view.md`; `docs/` is
  user-facing - internal mechanics, design reasons and history go to `dev/`
  (index in `dev/README.md`)
- `dev/rq/` holds the requirements of `rq` itself and the tests that check them;
  keep them in line with a behavior change, and check with `npm -w asljs-rq run
  build && npm -w asljs-rq run build:dist`, then `node ../../bin/rq.js test .`
  and `node ../../bin/rq.js coverage .` in `dev/rq` (results go to `dev/rq/.rq`)
- text (statements, descriptions, steps) is edited directly; structure (links,
  `## Implementation` items, files, results) only through the commands
- the file name is the kind (`getNodeKind`): `R<n> <name>.md` a requirement,
  `T<n> <name>.md` a test; any other document is not a node and is ignored by
  the graph, though `remove` and `move` still fix links in it
- edges are only the links in a requirement's `## Implementation` list,
  reference links included (`RqDocument.implementation`); `links` holds every
  local `.md` link, for rewriting
- a file path is the only root; a folder's roots are the requirements no other
  requirement links to, and there may be several
- the diagram is `graph LR`
- the change commands only write links into `## Implementation`, but remove and
  rewrite links anywhere; `remove`, `move`, `backlinks` and the id of `add` look
  at every `.md` file of the working folder
- every command takes `--working-dir`, which `runCli` turns into `Io.cwd`: paths
  resolve against it, output is relative to it, `.rq` lives in it; a requirement
  or test argument may be an id or a `.md` name, searched for recursively in it
  (`resolveTarget`)
- a requirement has one parent (`loadGraph` reports a second), a test any
  number; a test has no `## Implementation` section (`rq check` reports one)
- `link` refuses a link from a test, a duplicate, a cycle, and a requirement
  that already has a parent in the working folder
- results are recorded in `.rq/E<n> <slug>.md` of the working folder by `rq
  test` and `rq log`, as history only: statuses are read from the documents' `##
  Status` (`getStatuses`), never from `.rq`; a test has its recorded `Result`, a
  requirement its recorded one unless it is recalculated, from its links, so a
  failed test fails everything above it
- `rq test` without `--recurse` runs the targets' direct tests, recalculates the
  targets and what is above them, and prints the targets' sub-requirements as
  `(recorded)` with their recorded status
- after recording, `writeStatuses` writes the `## Status` section
  (`status-section.ts`) of each test that ran - `Result` and `Execution` - and
  recalculates the changed documents and every requirement above them
  (`withAncestors`); `Coverage` is kept, and a document never run and without a
  section is left alone
- `rq` formats no markdown: markdown writes go through `writeMarkdown`, and
  `runCli` then runs `markdownPostProcessing` of the nearest `rq.json` on them
  (`post-process.ts`); this package's `rq.json` runs `npx toolkit flint`
- `.rq` keeps at most 300 files and 50 MB (`pruneExecutions`, after `rq test`
  and `rq log`), never removing a test's latest result
- `rq coverage` (always AI, read-only) writes the `Coverage` status and the
  agent's analysis to `## Coverage` (`coverage-section.ts`); it is independent
  of `rq test`, which has no coverage check
- the diagram's border colour is the result (neutral, green, red for a test,
  amber for a requirement), its style the coverage (solid, dashed, dotted for
  never checked) - `getAppearance`
- `rq test` targets are files, folders, names or ids; a requirement target runs
  its direct tests, with `--recurse` all below it, a folder all of its tests
- `rq check` reports a `## Log` section left from the old format
- steps are `###` headings under `## Steps` (`parseSteps`), typed by a `- Type:`
  item or inferred (code block: `shell`, else `instruction`); they run in the
  test's folder until the first failure; `shell` lines run with `shell: true`,
  `javascript` (`node --test --test-reporter=tap`, without `NODE_TEST_CONTEXT`)
  and `dotnet` without a shell; a run of no test fails
- `instruction` steps always use an agent: `--ai`'s, else the detected one
  (`detectAgent`, claude then copilot) with read-and-run tools; `rq coverage`
  uses one read-only; `RQ_AI_COMMAND` replaces both, and tests set
  `Io.detectAgent` so no real agent runs
- `rq view` reloads the graph on every request for `/` and serves only files
  inside the folder

## Source map

Running commands, the agents, markdown helpers, finding files, post-processing
and the document server are in `asljs-mdcli` (`libs/mdcli`), shared with
`board`; a change there needs `npm -w asljs-mdcli run build:dist`.

- `src/document.ts` - parses a document
- `src/edit.ts` - structural text edits by mdast positions: list items, link
  removal and rewriting, the heading
- `src/scope.ts` - the documents of a folder: backlinks, referrers, next id
- `src/query.ts` - `list`, `links`, `backlinks`, `tojson`
- `src/change.ts` - `add`, `link`, `unlink`, `remove`, `move`, `log`
- `src/check.ts` - `check`
- `src/graph.ts` - finds the roots, walks the links, reports structure errors
- `src/steps.ts` - parses the steps of a test
- `src/run-test.ts` - runs the steps and collects their output
- `src/results.ts` - the execution files: the git working directory, writing,
  reading the latest result of each test
- `src/status.ts` - the status of every node from the documents, and writing it
- `src/status-section.ts` - reads and writes the `## Status` section
- `src/targets.ts` - the nodes the targets of `test` and `coverage` select
- `src/coverage.ts` - `coverage`, the AI coverage check
- `src/coverage-section.ts` - writes the `## Coverage` analysis
- `src/test.ts`, `src/view.ts` - the commands; `src/cli.ts` wires them
  (`createCli` builds the program, `runCli` runs it)
- `src/mcp.ts` - `rq-mcp`: a tool per command of `createCli`, through
  `commandTools` of `asljs-mdcli`; a new command or option becomes a tool
  argument with no change here
- `src/mermaid.ts` - the diagram of the graph

## Tests

Tests build requirements in a temporary folder with `src/testing/fixture.ts`,
and capture output, fix the clock and the git working directory, and disable
agent detection with `src/testing/test-io.ts`. The AI steps and the coverage
check are tested with a fake agent through `RQ_AI_COMMAND`, and the view with a
server on port 0.
