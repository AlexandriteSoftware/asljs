# R27 Checking the graph

`rq check` reports structure errors and malformed documents without running
anything.

## Implementation

- [T20 Checking the graph][T20]

[T20]: <../tests/T20 Checking the graph.md>

## Coverage

The requirement has three statements, and T20 covers each of them through its
three steps, which run the unit tests in `apps/rq/src/check.test.ts`.

- **`rq check` runs nothing.** The step "execCheck passes a well-formed graph
  without running its steps" checks a well-formed fixture graph. It asserts exit
  code 0 and the output `OK  2 requirements, 2 tests`. It also asserts that no
  execution file (`.rq/E2 reqs.md`) was written, which shows that no test steps
  ran and nothing was recorded.
- **`rq check` reports structure errors.** The step "execCheck reports problems
  of the graph and of each document" reports graph-level errors from
  `loadGraph`/`walk` in `src/graph.ts`: a link to a file that does not exist
  (`the link to R9 Gone.md points at no file`) and a link to a document that is
  neither a requirement nor a test (`the link to notes.md is not a requirement
  or test`). The exit code is 1. This shows that the graph's structure errors
  reach the `rq check` output.
- **`rq check` reports malformed documents.** The same step covers a missing
  level 1 heading, an `## Implementation` section that holds more than a list,
  an item that links to nothing, a requirement with no links, a requirement with
  steps, a `## Steps` section with content before its first step, a test with an
  `## Implementation` section, and the old `## Log` section. The step "execCheck
  reports a malformed Status and a test with a coverage" covers a malformed `##
  Status` item, and a test that has a `Coverage` status or a `## Coverage`
  section.

One gap is worth closing, though the requirement doesn't strictly need it.
`src/graph.ts` has other structure errors that T20 never triggers through `rq
check`:

- a cycle (`findCycles`)
- a requirement linked from more than one requirement (`findSharedRequirements`)
- a document no root can reach
- several documents with the same id (`findDuplicateIds`)

The requirement says only "structure errors" in general, and T20 shows that
graph errors flow into the `rq check` output. So the statement is covered. To
make it stronger, add a case to `check.test.ts` (and a step to T20) with a cycle
and a requirement that has two parents, and assert that `rq check` reports both
and exits with 1.

## Status

- Result: PASS
- Coverage: COMPLETE
