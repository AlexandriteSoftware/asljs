# rq

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries and tools for everyday use.

AI-assisted markdown-based requirements management: AI skills to manage and
verify them, tools for structural modification and reporting, presentation apps
to manage requirement graphs visually.

## Overview

A requirement is a markdown file with a statement about the system. A big
requirement is decomposed into smaller ones, and each requirement links to the
requirements and tests that implement it. A test is a markdown file with steps
that show a requirement holds: deterministic, reproducible commands. The results
of each run are kept apart, in `.rq/E<n> <slug>.md` execution files that also
record the git commit, branch and changed files.

The links form a directed graph with no cycles: the requirements are a strict
hierarchy, each with one parent, and a test may be linked from several
requirements. A requirement nothing links to is a root, and there may be
several. A requirement passes when every test and requirement it links to
passes, by the statuses they record, and holds when its statements are also
fully covered by them.

- Commands add, link, unlink, move and remove requirements and tests, and log
  results, keeping every link valid, the graph free of cycles and each
  requirement with one parent; others list a requirement's links, its backlinks,
  or the whole graph as JSON.
- `rq check <path>` checks the structure; `rq test <target>...` runs the tests
  of requirements, tests, ids such as `R10` or folders, with `--recurse` those
  below them too, records the run in an execution file and reports each status;
  test steps are shell commands, JavaScript or .NET tests, or instructions an AI
  agent carries out. Each test and requirement keeps its latest result in its
  `## Status` section; a failed test fails every requirement above it.
- `rq coverage <target>...` asks an AI agent whether each requirement's
  sub-requirements and tests fully cover it, and records the verdict.
- `rq view <path>` serves the graph as a clickable diagram, each border coloured
  by the result and drawn solid, dashed or dotted by the coverage, and each
  document rendered as HTML.
- The [skills][SK] tell an AI agent how to decompose requirements, write tests,
  close the coverage gaps `rq coverage` describes in each requirement's `##
  Coverage` section, and update the related requirements after a change: it
  writes the text, and changes the structure with the commands.

## Scope

- Requirements and tests are plain markdown files, kept with the code.
- The graph holds requirements, `R<n> <name>.md`, and tests, `T<n> <name>.md`,
  and nothing else; its edges are the links in each requirement's `##
  Implementation` list. Other documents are not part of the graph, though `rq
  remove` and `rq move` fix the links to what they remove or move in every `.md`
  file of the working folder.
- Steps run in order, in the test's folder, until the first that fails. An
  instruction step needs an AI agent, `claude` or `copilot`; the first one
  installed is used unless `--ai` names one.
- The view loads Mermaid from a CDN to draw the diagram; the documents and their
  links work without it.

## Installation

```bash
npm install asljs-rq
```

## Usage

Build the graph with the commands, and write the statements, descriptions and
steps as text:

```bash
npx rq add requirement "requirements/R1 Export.md" "CSV export"   --statement "The report exports as CSV."
npx rq add test "requirements/R1 Export.md" "PDF export"   --description "The PDF export test produces a valid PDF."   --step 'npm test -- --test-name-pattern="PDF export"'
```

The parent, `requirements/R1 Export.md`, now lists them:

```markdown
# R1 Export

The application exports a report as CSV and as PDF.

## Implementation

- [R2 CSV export](<R2 CSV export.md>)
- [T1 PDF export](<tests/T1 PDF export.md>)
```

Query the structure:

```bash
npx rq links "requirements/R1 Export.md" --json
npx rq backlinks "requirements/tests/T1 PDF export.md"
npx rq tojson requirements
```

Check it, then run the test:

```bash
npx rq check requirements
npx rq test requirements
```

```text
FAIL     requirements/R1 Export.md - 1 of 2 links failed
FAIL     requirements/R2 CSV export.md - links to no requirement or test
PASS     requirements/tests/T1 PDF export.md - 1 step
Results  .rq/E1 requirements.md
```

The execution file records the run and the working directory, then each test:

````markdown
# E1 requirements

- Date: 2026-10-08T09:30:00.000Z
- Command: `rq test requirements`
- Result: PASS - 1 of 1 tests passed
- Commit: 3f2a9c1d0b8e7f6a5c4d3e2f1a0b9c8d7e6f5a4b
- Branch: main
- Changed files: none

## T1 PDF export

- File: <requirements/tests/T1 PDF export.md>
- Result: PASS - 1 step

```text
[step 1] Step 1
$ npm test -- --test-name-pattern="PDF export"
...
```
````

Run a single requirement and everything below it by id, from any folder:

```bash
npx rq test R1 --recurse --working-dir path/to/project
```

Browse the graph and the documents:

```bash
npx rq view requirements --port 8080
```

## Further reading

- [Requirements][RM] - the requirement and test formats, and how the graph is
  built.
- [Querying the graph][QG] and [Changing the graph][CG] - the structural
  commands.
- [rq check][CK], [rq test][TS], [rq coverage][CV] and [rq view][VW] - checking,
  testing, checking coverage and viewing.
- [Skills][SK] - the AI skills for managing requirements.

Questions and bugs: [asljs/issues][IS].

## Related packages

- `asljs-part` defines project artefacts in markdown and checks them with rules.

## License

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
[CG]: <docs/Changing the graph.md>
[CK]: <docs/rq check.md>
[CV]: <docs/rq coverage.md>
[IS]: https://github.com/AlexandriteSoftware/asljs/issues
[QG]: <docs/Querying the graph.md>
[RM]: docs/Requirements.md
[SK]: skills
[TS]: <docs/rq test.md>
[VW]: <docs/rq view.md>
