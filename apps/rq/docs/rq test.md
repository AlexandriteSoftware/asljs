# rq test

Runs the tests of requirements and tests, records the results in an execution
file, writes the statuses that follow to the `## Status` sections, and reports
the status of each target. It exits with a non-zero code when a reported node
does not pass or the graph has a structure error.

```text
rq test <target>... [--recurse] [--working-dir <folder>] [--name <slug>]
        [--ai[=<agent>][:<model>]]
```

## Targets

Each target is one of:

- an id, e.g. `R10` or `T12`, or a `.md` name: the requirement or test the
  working folder and its subfolders hold;
- a requirement or test file, relative to the working folder;
- a folder, relative to the working folder; see [Requirements][RM] for how its
  roots are found.

See [Working folder][WF] for how ids and names are matched.

```text
rq test R10 R56 R100 T12 --recurse
```

What runs:

- a test target runs itself;
- a requirement target runs the tests it links to directly, and with `--recurse`
  every test below it;
- a folder target runs every test of its graph.

Each test runs once, however many targets reach it.

## Results

The run is written to `.rq/E<n> <slug>.md` in the working folder, with `<n>` the
next free number; see [Requirements][RM] for the format. Then the result of each
test it ran is written to its `## Status` section, and the targets and every
requirement above them are recalculated and written; a failed test fails every
requirement above it. Nothing is written when no test runs.

## Output

One line per reported node: each target, the tests it ran, and with `--recurse`
or for a folder everything below it; without `--recurse`, also each requirement
a target links to, marked `(recorded)`, with the status its document records.
Then one `Error` line per structure error, the path of the execution file, one
`Updated` line per document whose status changed, and one `Removed` line per old
execution file the [retention][RT] removed.

```text
FAIL     requirements/R1 Export.md - 1 of 2 links failed
PASS     requirements/R2 CSV export.md
PASS     requirements/tests/T1 PDF export.md - 1 step
FAIL     requirements/tests/T2 CSV export.md - step 1 exited with code 1: 1 test failed
Error    R2 CSV export.md: the link to R3.md points at no file.
Results  .rq/E4 requirements.md
Updated  requirements/R1 Export.md
Updated  requirements/tests/T2 CSV export.md
```

Without `--recurse`, `rq test R1` runs the tests R1 links to and merges their
results with the statuses its sub-requirements record, which it does not
recalculate; `--recurse` reruns the tests below them too. The statuses come from
the documents' `## Status` sections, never from `.rq`.

```text
NOT RUN  requirements/R1 Export.md - 1 of 2 links not run
PASS     requirements/tests/T1 PDF export.md - 1 step
NOT RUN  requirements/R2 CSV export.md (recorded) - 1 of 1 links not run
```

A requirement is:

- `PASS` when every node it links to passes;
- `FAIL` when one fails, or when it links to nothing;
- `NOT RUN` otherwise: something below it has no result yet.

## Options

- `--recurse` - also run the tests of every requirement below a requirement
  target.
- `--working-dir <folder>` - the working folder; the current directory by
  default.
- `--name <slug>` - the slug of the execution file. By default the targets, a
  path by its file or folder name: `rq test R10 T12` writes `E<n> R10 T12.md`.
- `--ai[=<agent>][:<model>]` - the AI agent of instruction steps, `claude` or
  `copilot`, and its model, both optional: `--ai`, `--ai=claude:fable`,
  `--ai=copilot`.

Instruction steps always use an agent: the one `--ai` names, or the first of
`claude` and `copilot` that is installed. Such a step may read files and run
commands, and is told and configured not to edit files; see [Requirements][RM]
for what that does not prevent. An instruction step without an agent fails.
Write `--ai=<agent>` with `=` when a target follows it, e.g. `rq test
--ai=claude R1`, so that the target is not taken for the agent. Coverage is
checked by [`rq coverage`][CV], not by `rq test`.

## Environment

- `RQ_AI_COMMAND` - a command line that replaces the agent. It gets the prompt
  on standard input, and its verdict is the last line of its output that is
  `{"result":"OK"}` or `{"result":"Fail","message":"..."}`.

[CV]: <rq coverage.md>
[RM]: Requirements.md
[RT]: Requirements.md#results
[WF]: Requirements.md#working-folder
