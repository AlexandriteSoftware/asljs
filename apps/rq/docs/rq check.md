# rq check

Checks the structure of the graph and of each document without running anything.
It exits with a non-zero code when it finds a problem.

```text
rq check <path>
```

`<path>` is a requirement file or a folder; see [Requirements][RM] for the
problems it reports.

```text
Error  RQ1 Export.md: the link to RQ3.md points at no file.
Error  evidence/EV2 CSV export.md: the log entry "today Passed" is not "<time> Passed|Failed[ - <note>]".
```

Without problems it prints a count:

```text
OK  2 requirements, 2 evidence
```

Run it after editing documents by hand, and before `rq verify`, which runs the
steps.

[RM]: Requirements.md
