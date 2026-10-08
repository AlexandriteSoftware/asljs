# rq

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

AI-assisted requirements management for requirements written in markdown: AI
skills to write and update them, a verifier, and a browser view of the
requirements graph.

## Overview

A requirement is a markdown file with a statement about the system. A big
requirement is decomposed into smaller ones, and each requirement links to the
requirements and evidence that implement it. An evidence is a markdown file with
steps that show a requirement holds: deterministic, reproducible commands, and a
log of their runs.

The links form a directed graph with no cycles and a single root. A requirement
holds when everything it links to holds, and its statements are fully covered by
them.

- `rq verify <path>` checks the graph, runs the evidence steps and logs each run
  in the evidence file; with `--ai`, an AI agent checks that every requirement
  is fully covered.
- `rq view <path>` serves the graph as a clickable diagram, and each document
  rendered as HTML.
- The [skills][SK] tell an AI agent how to decompose requirements, write
  evidence, and update the related requirements after a change.

## Scope

- Requirements and evidence are plain markdown files, kept with the code.
- A link to a local `.md` file is an edge; an evidence is a document with a `##
  Steps` section.
- Steps run in a shell, one line per command; a step that exits with a non-zero
  code fails the evidence.
- The view loads Mermaid from a CDN to draw the diagram; the documents and their
  links work without it.

## Installation

```bash
npm install asljs-rq
```

## Usage

A requirement, `requirements/RQ1 Export.md`:

```markdown
# RQ1 Export

The application exports a report as CSV and as PDF.

- [RQ2 CSV export](<RQ2 CSV export.md>)
- [EV1 PDF export](<evidence/EV1 PDF export.md>)
```

An evidence, `requirements/evidence/EV1 PDF export.md`:

````markdown
# EV1 PDF export

The PDF export test produces a valid PDF.

## Steps

```sh
npm test -- --test-name-pattern="PDF export"
```
````

```bash
npx rq verify requirements
```

```text
OK    RQ1 Export.md
OK    RQ2 CSV export.md
OK    evidence/EV1 PDF export.md - 1 step
OK    evidence/EV2 CSV export.md - 1 step
```

Each run is appended to the evidence's `## Log`:

```markdown
## Log

- 2026-10-08T09:30:00.000Z Passed - 1 step
```

```bash
npx rq view requirements --port 8080
```

## Further reading

- [Requirements][RM] - the requirement and evidence formats, and how the graph
  is built.
- [rq verify][VF] and [rq view][VW] - the commands.
- [Skills][SK] - the AI skills for managing requirements.

Questions and bugs: [asljs/issues][IS].

## Related packages

- `asljs-part` defines project artefacts in markdown and checks them with rules.

## License

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
[IS]: https://github.com/AlexandriteSoftware/asljs/issues
[RM]: docs/Requirements.md
[SK]: skills
[VF]: <docs/rq verify.md>
[VW]: <docs/rq view.md>
