# AGENTS

## Purpose

Use this file as AI-facing guidance for `asljs-rq`.

This package manages requirements written in markdown: it verifies the graph of
requirements and evidence, runs the evidence steps, and serves the graph and the
documents in a browser. Its `skills/` tell an AI agent how to write and update
requirements.

## AI Quick Reference

- the formats are in `docs/Requirements.md`; the commands in `docs/rq verify.md`
  and `docs/rq view.md`
- a document with a `## Steps` section is an evidence; any other is a
  requirement
- every link and link definition from a requirement to a local `.md` file is an
  edge; links in an evidence are not
- a file path is the root; a folder's root is the one document no other document
  of the folder links to
- `rq verify` writes: it appends a `## Log` entry to every evidence it runs
- steps run with `shell: true` in the evidence's folder, one line per command
- `--ai` uses the same agent commands as `part check --ai`; `RQ_AI_COMMAND`
  replaces them
- `rq view` reloads the graph on every request for `/` and serves only files
  inside the folder

## Source map

- `src/document.ts` - parses a document; appends log entries
- `src/graph.ts` - finds the root, walks the links, reports structure errors
- `src/evidence.ts` - runs the steps and logs the run
- `src/coverage.ts` - the AI coverage check
- `src/verify.ts`, `src/view.ts` - the commands; `src/cli.ts` wires them
- `src/mermaid.ts` - the diagram of the graph

## Tests

Tests build requirements in a temporary folder with `src/testing/fixture.ts`,
and capture output and fix the clock with `src/testing/test-io.ts`. The AI check
is tested with a fake agent through `RQ_AI_COMMAND`, and the view with a server
on port 0.
