# History

How `rq` got to its current shape.

- Tests were called evidence, `EV<n>`, and requirements `RQ<n>`; they are `T<n>`
  and `R<n>`. `rq verify` is `rq test`.
- Results were first appended to a `## Log` section of each test, then moved to
  execution files with no status in the documents, and finally mirrored into `##
  Status` sections. `rq check` still reports a `## Log` section so that old
  documents are noticed.
- `rq test --ai` used to check coverage as well; coverage is now its own
  command, `rq coverage`, so that running tests never costs agent calls.
- `--in <folder>` became `--working-dir <folder>`, which also sets where
  relative paths resolve and where `.rq` lives.
