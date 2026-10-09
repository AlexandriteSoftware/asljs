# Querying the graph

Commands that print the structure of the graph without changing anything. Paths
are printed relative to the working folder, with `/` separators.

The text output has one line per document: its kind - `requirement`, `test`,
`other` for an `## Implementation` link to a document that is neither, or
`missing` for one to no file - its path, and for a requirement or test its
status, `PASS`, `FAIL` or `NOT RUN`, as its `## Status` records it, then for a
requirement its coverage, `COMPLETE` or `INCOMPLETE`, when it was checked; see
[Requirements][RM]. The commands take only requirement and test files.

```text
requirement  requirements/R1 Export.md  FAIL
test         requirements/tests/T1 PDF export.md  PASS
```

With `--json` the same documents are printed as an array of `{ path, kind,
title, status, coverage }`; `status` is `null` for any other document, and
`coverage` for one that is not a requirement or was never checked.

Every command takes `--working-dir <folder>`, and a requirement or test as a
path, `.md` name or id; see [Working folder][WF]. The results are read from the
working folder's `.rq` folder.

## rq list

```text
rq list <path> [--working-dir <folder>] [--json]
```

Every document of the graph of a requirement file or folder, in breadth-first
order from the roots. Structure errors are written to standard error.

## rq links

```text
rq links <requirement> [--working-dir <folder>] [--json]
```

What a requirement's `## Implementation` list links to.

## rq backlinks

```text
rq backlinks <file> [--working-dir <folder>] [--json]
```

The requirements that link to a requirement or a test, looked for in every `.md`
document of the working folder. Links in a test are not edges, so a test is
never a backlink.

## rq tojson

```text
rq tojson <path> [--working-dir <folder>]
```

The graph as JSON:

- `roots` - the paths of the roots, empty when a folder has none;
- `errors` - the structure errors;
- `nodes` - every document, from the roots down, with `path`, `kind`, `title`,
  `body` (the statement or description), `links` (the paths its `##
  Implementation` links to), `steps`, `status` and `coverage`.

[RM]: Requirements.md
[WF]: Requirements.md#working-folder
