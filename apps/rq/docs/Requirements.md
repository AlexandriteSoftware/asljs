# Requirements

How `rq` reads requirements and tests, and how it builds the graph from them.

## Model

The model is a directed graph of requirements and tests, and nothing else: it is
not a graph of every document and every link. An edge from a requirement to
another node says the requirement is implemented by implementing that
requirement or by passing that test. The graph has no cycles. A root is a
requirement nothing links to; a graph may have several, e.g. one per product
area.

Both relationships are links from a requirement, in its `## Implementation`
list:

- requirement to requirement - the requirements form a strict hierarchy: every
  requirement but a root has exactly one parent. A requirement does not name its
  parent.
- requirement to test - a requirement links to every test that checks whether it
  is implemented, and a test may check several requirements. Tests have no `##
  Implementation` list and link to no node.

A requirement is fully covered when every statement it makes is implemented by
at least one of the nodes it links to. A test passes when its latest
[result][RS] is `PASS`. A requirement passes when every node it links to passes,
and it holds when, in addition, it is fully covered.

## Nodes

The file name says what a document is:

- `R<n> <name>.md` - a requirement, e.g. `R12 CSV export.md`;
- `T<n> <name>.md` - a test, e.g. `T3 PDF export.md`;
- any other document, e.g. a README or a design note, is not part of the graph.
  Requirements may link to it from their text, and the commands ignore it.

The level 1 heading is a node's title; without one, the file name is. The `rq
add` commands name a new file with the next free number of its kind.

## Requirement

- The text between the heading and the first section is its statement. It may
  link to anything; those links are references, not edges.
- `## Implementation` - its edges: one list item per link to a requirement or a
  test, `- [<title>](<path>)`, relative to the document. The
  [change commands][CH] write this list.
- A requirement whose `## Implementation` links to nothing fails: it is neither
  decomposed nor tested.
- `## Coverage` - the analysis of the latest [`rq coverage`][CV]: why it is
  fully covered, statement by statement, or what nothing covers and what to do
  - a test to add, a sub-requirement to add, a change to make. `rq coverage`
    owns the section and rewrites it; it sits before `## Status`.
- `## Status` - its result and coverage, written by the commands; see
  [Status][ST].

```markdown
# R1 Export

The application exports a report as CSV and as PDF, as the [design
notes](notes.md) describe.

## Implementation

- [R2 CSV export](<R2 CSV export.md>)
- [T1 PDF export](<tests/T1 PDF export.md>)
```

## Test

- `## Steps` - one step per `###` heading, run one after another in the test's
  folder; the first that fails fails the run. Steps must be deterministic and
  reproducible: the same steps on the same code give the same result.
- `## Status` - its latest result, written by the commands; see [Status][ST].
- A test has no edges. Its text may link to the requirements it checks, but does
  not have to; such a link is a reference, not structure.

````markdown
# T1 PDF export

The PDF export test produces a valid PDF.

## Steps

### Build

```sh
npm run build
```

### Export test

- Type: javascript
- File: ../../build/export.test.js
- Test: exports a PDF

### The PDF has two pages

Open `out/report.pdf` and check that it has two pages, with the totals on the
last.
````

### Steps

A step's heading is its title. Its type is the `- Type:` item of a list of
fields at the start of the step; without one, a step with a code block is
`shell`, and any other `instruction`.

- `shell` - every line of its code blocks is a command, run one after another in
  the platform's shell - `cmd.exe` on Windows, `/bin/sh` elsewhere - so keep
  shared steps to commands both understand, e.g. `node` and `npm`. Empty lines
  and lines starting with `#` are skipped, and a line ending with `\` is joined
  with the next. The first command that exits with a non-zero code fails the
  step.
- `javascript` - `node --test` of `- File:`, relative to the test's folder; with
  `- Test:`, only the tests whose name contains that caption. It fails when the
  run fails or runs no test.
- `dotnet` - `dotnet test`, of `- Project:` when given, with `- Filter:` as its
  `--filter` criteria when given. It fails when the run fails or no test matches
  the filter.
- `instruction` - the step's text, carried out by an AI agent; its verdict
  passes or fails the step. The agent is the one `--ai` names, or the first of
  `claude` and `copilot` that is installed; `RQ_AI_COMMAND` replaces it. Without
  one, the step fails. The agent may read files and run commands, and is told
  and configured not to edit files, but a command it runs can still change them:
  run instruction steps only on a project you trust, or wrap the agent in a
  sandbox with `RQ_AI_COMMAND`.

The field names and `Type` values are case-insensitive; `js` is `javascript`,
`.NET` is `dotnet`. A test with a step `rq` cannot read - an unknown type, a
shell step without commands, a JavaScript step without a file - fails without
running any step, and `rq check` reports the problem.

## Results

Every [`rq test`][TS] run, and every result recorded with `rq log`, is an
execution file, `E<n> <slug>.md`, in the `.rq` folder of the
[working folder][WF]. `<n>` is the next free number, so a higher number is a
later execution - runs at the same time get different numbers; the slug says
what ran. Folders whose name starts with `.`, like `.rq`, are not part of the
graph.

- The list under the heading: the date, in ISO 8601 UTC, the command line, the
  overall result with the number of tests that passed, and the git working
  directory - the commit, the branch, and the changed and untracked files of the
  working folder; `none` outside a repository.
- One `## <test>` section per test, headed with the test's file name without
  `.md`: its file, relative to the working folder, its result, `PASS` or `FAIL`,
  with a short note, and its output: `[step <n>] <title>` before each step, then
  each command it ran, after `$ `, with what it wrote to standard output and
  error, or the agent's answer.

````markdown
# E4 requirements

- Date: 2026-10-09T10:00:00.000Z
- Command: `rq test requirements`
- Result: FAIL - 1 of 2 tests passed
- Commit: 3f2a9c1d0b8e7f6a5c4d3e2f1a0b9c8d7e6f5a4b
- Branch: main
- Changed files:
  - `M src/export.ts`
  - `?? src/csv.ts`

## T1 PDF export

- File: <requirements/tests/T1 PDF export.md>
- Result: PASS - 1 step

```text
$ npm test -- --test-name-pattern="PDF export"
...
```

## T2 CSV export

- File: <requirements/tests/T2 CSV export.md>
- Result: FAIL - step 1 exited with code 1: 1 test failed

```text
$ npm test -- --test-name-pattern="CSV export"
...
```
````

The `.rq` folder keeps at most 300 execution files and 50 MB: after each
execution, the oldest files beyond either limit are removed, except one that
holds the latest result of a test that still exists, so no status is lost.

The execution files are the history of the runs; the statuses are not read from
them but from the documents - see [Status][ST]. Whether to commit `.rq` is
therefore the project's choice: committed, it keeps the history with the code,
at the cost of a new file per run; ignored, nothing is lost but the history.

A requirement's status follows from the nodes it links to:

- `PASS` - every one passes;
- `FAIL` - one fails, or it links to nothing: a failed step fails its test and
  every requirement above it;
- `NOT RUN` - otherwise: something below it has no result yet.

[`rq test`][TS], [`rq list`][QG], [`rq view`][VW] and the diagram report these
statuses.

## Status

Every requirement and test may end with a `## Status` section, a list the
commands own, like `## Implementation`:

- `- Result: PASS|FAIL|NOT RUN[ - <note>]` - its status, with the test's note or
  why a requirement fails. This is where every command reads the status from: a
  test without it is `NOT RUN`, and a requirement without it gets the status
  that follows from its links;
- `- Execution: <link>` - a test's link to the execution file of its latest
  result;
- `- Coverage: COMPLETE|INCOMPLETE[ - <note>]` - a requirement's latest
  [`rq coverage`][CV] verdict: whether its sub-requirements and its own tests
  together provide sufficient functional coverage. Without it, coverage is not
  checked.

```markdown
## Status

- Result: FAIL - 1 of 2 links failed
- Coverage: INCOMPLETE - Nothing covers CSV quoting.
```

After a run, `rq test` writes the result of each test it ran, and recalculates
its targets, what it ran, and every requirement above them, from the statuses
the documents record; every other requirement keeps its recorded `Result`, and
`Coverage` is kept. `rq log` does the same for the one test it records, whatever
its `--time`. A document never run gets no section. `rq add`, `link`, `unlink`,
`remove` and `move` update the `Result` of the documents that have one, since a
structural change can change it. `rq coverage` writes only `Coverage`; it is
independent of the results.

Anything else in the section - another list item, a paragraph, a link
definition - is kept as it is when `rq` updates its items; `rq check` reports
list items it does not know.

## Configuration

`rq` reads `rq.json` from the working folder or the nearest of its parents, e.g.
the project root:

```json
{
  "markdownPostProcessing": "npx toolkit flint"
}
```

- `markdownPostProcessing` - a command line that `rq` runs after a command that
  wrote markdown files - requirements, tests, execution files - with those files
  as arguments, relative to the folder of `rq.json`, where it runs. Use it to
  apply the project's own formatter and linter to what `rq` writes. When it
  fails, `rq` prints its output and exits with a non-zero code; the files stay
  written.

The links the commands add are reference links labelled with the id of their
target, e.g. `- [T1 PDF export][T1]` and `[T1]: <tests/T1 PDF export.md>`.

## Working folder

Every command works in a folder: the current directory, or `--working-dir
<folder>`. Relative paths resolve against it, output paths are relative to it,
its `.rq` folder holds the results, and the scope - the documents searched for
backlinks, links to rewrite and the next free id - is every `.md` file in it and
its subfolders.

Where a command takes a requirement or test, it also takes:

- an id, e.g. `R19` or `T12` - the document of the working folder whose file
  name starts with it;
- a `.md` name, e.g. `R19 Export.md` - that path when it exists, otherwise the
  document of the working folder with that file name.

Ids and names are searched for in the working folder and all its subfolders; an
error when none or several match.

```text
rq test R19 --working-dir c:/projects/project1
```

## Roots

The commands take a path, a `.md` name or an id:

- a requirement or test file is the only root; the graph is what it reaches;
- a folder's roots are the requirements of the folder and its subfolders that no
  other requirement links to; the graph is what they reach. Folders whose name
  starts with `.` and `node_modules` are skipped.

## Structure errors

- An `## Implementation` link to a missing file, or to a document that is not a
  requirement or test.
- A cycle.
- A requirement linked from more than one requirement.
- In a folder, an id that more than one document has, e.g. `T1 A.md` and `T1
  B.md`: ids name documents in commands and execution files, so they must be
  unique.
- In a folder, no root - the cycles between its requirements are still
  reported - and requirements or tests no root reaches, e.g. a test nothing
  links to: such a test is not run until a requirement links to it.

[`rq check`][CK] also reports a test with a `## Coverage` section, and, per
node, a missing level 1 heading, a requirement that links to nothing, a test
without a `## Steps` section and any problem of its steps, a requirement with
steps, a test with an `## Implementation` section, an `## Implementation` item
without a link, anything but a list in `## Implementation`, a `## Status`
section that does not follow the format or gives a test a coverage, and a `##
Log` section left from an older version of `rq`.

## Editing

Text an author or an AI agent writes - a statement, a description, the steps,
any other section - is edited directly. The structure is changed with the
[commands][CH]: adding requirements and tests, linking, unlinking, removing,
moving and logging. They keep links valid, refuse cycles and a second parent,
and write the `## Implementation` list and the execution files in the format
above.

[CH]: <Changing the graph.md>
[CV]: <rq coverage.md>
[CK]: <rq check.md>
[QG]: <Querying the graph.md>
[RS]: #results
[ST]: #status
[TS]: <rq test.md>
[VW]: <rq view.md>
[WF]: #working-folder
