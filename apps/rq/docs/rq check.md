# rq check

Checks the structure of the graph and of each document without running anything.
It exits with a non-zero code when it finds a problem.

```text
rq check <path> [--working-dir <folder>]
```

`<path>` is a requirement file, a folder, a `.md` name or an id; see
[Requirements][RM] for the problems it reports. `--working-dir` is the working
folder that paths, names and ids resolve in; see [Working folder][WF].

```text
Error  R1 Export.md: the link to R3.md points at no file.
Error  tests/T2 CSV export.md: has a Log section; results are kept in .rq/E<n> files.
```

Without problems it prints a count:

```text
OK  2 requirements, 2 tests
```

Run it after editing documents by hand, and before `rq test`, which runs the
steps.

[RM]: Requirements.md
[WF]: Requirements.md#working-folder
