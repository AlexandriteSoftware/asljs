# Querying the graph

Commands that print the structure of the graph without changing anything. Paths
are relative to the working directory, and printed the same way, with `/`
separators.

The text output has one line per document: its kind, `requirement`, `evidence`
or `missing` for a link to no file, its path, and for an evidence the status of
its last log entry or `Not run`.

```text
requirement  requirements/RQ1 Export.md
evidence     requirements/evidence/EV1 PDF export.md  Passed
```

With `--json` the same documents are printed as an array of `{ path, kind,
title, status }`; `status` is `null` for a requirement and for an evidence never
run.

## rq list

```text
rq list <path> [--json]
```

Every document of the graph of a requirement file or folder, in breadth-first
order from the roots. Structure errors are written to standard error.

## rq links

```text
rq links <requirement> [--json]
```

The requirements and evidence a requirement links to.

## rq backlinks

```text
rq backlinks <file> [--in <folder>] [--json]
```

The requirements that link to a requirement or an evidence, looked for in every
`.md` document of `--in`, the working directory by default. Links in evidence
are not edges, so evidence is never a backlink.

## rq tojson

```text
rq tojson <path>
```

The graph as JSON:

- `roots` - the paths of the roots, empty when a folder has none;
- `errors` - the structure errors;
- `nodes` - every document, from the roots down, with `path`, `kind`, `title`,
  `body` (the statement or description), `links` (the paths it links to),
  `steps` and `log` (`{ time, status, note }` items).
