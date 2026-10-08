# Requirements

How `rq` reads requirements and evidence, and how it builds the graph from them.

## Model

The model is a directed graph of requirements and evidence, and nothing else: it
is not a graph of every document and every link. An edge from a requirement to
another node says the requirement is implemented by implementing that
requirement or by providing that evidence. The graph has no cycles. A root is a
requirement nothing links to; a graph may have several, e.g. one per product
area.

A requirement is fully covered when every statement it makes is implemented by
at least one of the nodes it links to. A requirement holds when it is fully
covered and every node it links to holds; an evidence holds when the last run of
its steps passed.

## Nodes

The file name says what a document is:

- `RQ<n> <name>.md` - a requirement, e.g. `RQ12 CSV export.md`;
- `EV<n> <name>.md` - an evidence, e.g. `EV3 PDF export.md`;
- any other document, e.g. a README or a design note, is not part of the graph.
  Requirements may link to it from their text, and the commands ignore it.

The level 1 heading is a node's title; without one, the file name is. The `rq
add` commands name a new file with the next free number of its kind.

## Requirement

- The text between the heading and the first section is its statement. It may
  link to anything; those links are references, not edges.
- `## Implementation` - its edges: one list item per link to a requirement or an
  evidence, `- [<title>](<path>)`. A reference link whose definition is
  elsewhere in the document counts too. The target is resolved relative to the
  document; a `#` fragment is dropped and percent-encoding is decoded. The
  [change commands][CH] write this list.
- A requirement whose `## Implementation` links to nothing fails verification:
  it is neither decomposed nor evidenced.

```markdown
# RQ1 Export

The application exports a report as CSV and as PDF, as the [design
notes](notes.md) describe.

## Implementation

- [RQ2 CSV export](<RQ2 CSV export.md>)
- [EV1 PDF export](<evidence/EV1 PDF export.md>)
```

## Evidence

- `## Steps` - every non-empty line of its code blocks is a command. Commands
  run in a shell, in the evidence's folder, one after another; the first that
  exits with a non-zero code fails the run. Steps must be deterministic and
  reproducible: the same commands on the same code give the same result.
- `## Log` - one list item per run: the time, in ISO 8601 UTC, the status,
  `Passed` or `Failed`, and a short note. `rq verify` and `rq log` append an
  item, adding the section at the end of the document when it is missing. The
  last item is the current status.
- An evidence has no edges, so it may link to the requirements it supports.

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

## Roots

The commands take a path:

- a requirement or evidence file is the only root; the graph is what it reaches;
- a folder's roots are the requirements of the folder and its subfolders that no
  other requirement links to; the graph is what they reach. Folders whose name
  starts with `.` and `node_modules` are skipped.

## Structure errors

- An `## Implementation` link to a missing file, or to a document that is not a
  requirement or evidence.
- A cycle.
- In a folder, no root, and requirements or evidence no root reaches: an
  evidence nothing links to, or requirements that link to each other in a cycle.

[`rq check`][CK] also reports, per node, a missing level 1 heading, a
requirement that links to nothing, an evidence without commands, a requirement
with steps or a log, an `## Implementation` item without a link, anything but a
list in `## Implementation` or `## Log`, and a malformed log entry.

## Editing

Text an author or an AI agent writes - a statement, a description, the steps,
any other section - is edited directly. The structure is changed with the
[commands][CH]: adding requirements and evidence, linking, unlinking, removing,
moving and logging. They keep links valid, refuse cycles, and write the `##
Implementation` and `## Log` lists in the format above.

[CH]: <Changing the graph.md>
[CK]: <rq check.md>
