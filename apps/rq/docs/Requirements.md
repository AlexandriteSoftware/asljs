# Requirements

How `rq` reads requirements and evidence, and how it builds the graph from them.

## Model

The model is a directed graph. Its nodes are markdown documents, each either a
requirement or an evidence. An edge from a requirement to another node says the
requirement is implemented by implementing that requirement or by providing that
evidence. The graph has no cycles. A root is a node nothing links to; a graph
may have several, e.g. one per product area.

A requirement is fully covered when every statement it makes is implemented by
at least one of the nodes it links to. A requirement holds when it is fully
covered and every node it links to holds; an evidence holds when the last run of
its steps passed.

## Requirement

Any markdown document without a `## Steps` section.

- The level 1 heading is its title; without one, the file name is.
- Every link and link definition to a local `.md` file is an edge, wherever it
  is in the document. The target is resolved relative to the document; a `#`
  fragment is dropped and percent-encoding is decoded.
- Links with a scheme, e.g. `https:`, and links to other files are not edges.
- A requirement that links to nothing fails verification: it is neither
  decomposed nor evidenced.
- The text between the heading and the first section is its statement.
- `## Implementation` - the list of links the [change commands][CH] write: one
  item per link, `- [<title>](<path>)`. Links elsewhere are edges too, but the
  commands only add links to this list.

```markdown
# RQ1 Export

The application exports a report as CSV and as PDF.

## Implementation

- [RQ2 CSV export](<RQ2 CSV export.md>)
- [EV1 PDF export](<evidence/EV1 PDF export.md>)
```

## Evidence

A markdown document with a `## Steps` section.

- `## Steps` - every non-empty line of its code blocks is a command. Commands
  run in a shell, in the evidence's folder, one after another; the first that
  exits with a non-zero code fails the run. Steps must be deterministic and
  reproducible: the same commands on the same code give the same result.
- `## Log` - one list item per run: the time, in ISO 8601 UTC, the status,
  `Passed` or `Failed`, and a short note. `rq verify` appends an item for every
  run, adding the section at the end of the document when it is missing. The
  last item is the current status.
- Links in an evidence are not edges, so it may refer to the requirements it
  supports.

````markdown
# EV1 PDF export

The PDF export test produces a valid PDF.

## Steps

```sh
npm test -- --test-name-pattern="PDF export"
```

## Log

- 2026-10-08T09:30:00.000Z Passed - 1 step
- 2026-10-09T10:00:00.000Z Failed - step 1 exited with code 1: 1 test failed
````

## Root

The commands take a path:

- a file is the only root; the graph is what it reaches through its links;
- a folder's roots are the `.md` documents of the folder and its subfolders that
  no other of them links to; the graph is what they reach. Folders whose name
  starts with `.` and `node_modules` are skipped.

## Structure errors

- A link to a missing file.
- A cycle.
- In a folder, no root, and documents no root reaches: both happen only when
  documents link to each other in a cycle.

[`rq check`][CK] also reports, per document, a missing level 1 heading, a
requirement that links to nothing, an evidence without commands, an `##
Implementation` item without a link to a `.md` file, anything but a list in `##
Implementation` or `## Log`, a malformed log entry, and a log in a requirement.

## Editing

Text an author or an AI agent writes - a statement, a description, the steps,
any other section - is edited directly. The structure is changed with the
[commands][CH]: adding requirements and evidence, linking, unlinking, removing,
moving and logging. They keep links valid, refuse cycles, and write the `##
Implementation` and `## Log` lists in the format above.

[CH]: <Changing the graph.md>
[CK]: <rq check.md>
