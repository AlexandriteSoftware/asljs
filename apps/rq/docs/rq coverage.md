# rq coverage

Asks an AI agent, for each requirement the targets select, whether its
sub-requirements and its own tests together provide sufficient functional
coverage, writes the verdict to the `- Coverage:` item of its `## Status`
section, and the agent's analysis to its `## Coverage` section. It exits with a
non-zero code when a checked requirement is incomplete or the graph has a
structure error.

```text
rq coverage <target>... [--recurse] [--working-dir <folder>]
            [--ai[=<agent>][:<model>]]
```

The targets are as for [`rq test`][TS]: ids, `.md` names, requirement files or
folders. A requirement target checks itself, and with `--recurse` every
requirement below it; a folder checks all its requirements. Tests are skipped.

It is independent of `rq test`: it runs no steps and reads no results, and `rq
test` keeps the coverage it writes.

```text
COMPLETE    requirements/R1 Export.md
INCOMPLETE  requirements/R2 CSV export.md - Nothing covers quoting of commas.
```

- The `## Coverage` section holds the analysis: when the requirement is
  complete, which requirement or test covers each statement; when it is not,
  each statement nothing covers and what to do - a test to add and what it
  should check, a sub-requirement to add and its statement, or a change to make.
  The agent is asked to name requirements and tests by their id; a link it
  writes anyway is replaced by its text. It is rewritten on every check, placed
  before `## Status`; a heading the agent writes is escaped so the section stays
  one section.

```markdown
## Coverage

Nothing covers "quotes fields that contain commas": T2 checks plain values only.

- Add a test that exports a value with a comma and checks it is quoted, or
- extend T2 with such a value.

## Status

- Coverage: INCOMPLETE - Nothing covers quoting of commas.
```

- A requirement that links to nothing is `INCOMPLETE` without asking, with an
  analysis that says to decompose it or add tests.
- The agent reads the requirement and what it links to; it is allowed to read
  and search files only, so it runs no command and changes no file. The reason
  it gives for an incomplete verdict becomes the note.
- The verdict is not invalidated by later edits: run `rq coverage` again after
  changing a requirement or what it links to.

## Options

- `--recurse` - also check every requirement below a requirement target.
- `--working-dir <folder>` - the working folder; see [Working folder][WF].
- `--ai[=<agent>][:<model>]` - the agent, `claude` or `copilot`, and its model,
  both optional; the first of `claude` and `copilot` that is installed by
  default. No agent is an error. `RQ_AI_COMMAND` replaces the agent, as for
  [`rq test`][TS].

[TS]: <rq test.md>
[WF]: Requirements.md#working-folder
