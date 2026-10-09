# requirements-authoring

Use when: writing a requirement, decomposing one into smaller requirements, or
writing the test that shows a requirement holds.

The formats are in [Requirements][RM]. Requirements (`R<n> <name>.md`) and tests
(`T<n> <name>.md`) are the nodes of one graph, and the links in each
requirement's `## Implementation` list are its edges. A requirement nothing
links to is a root; every other requirement is linked from exactly one
requirement, and every test from at least one. Other documents, and links in a
statement, are references the graph ignores.

## Text and structure

- Edit text directly: the statement of a requirement, the description and the
  `## Steps` of a test, and any section the commands do not own.
- Change the structure only with the [commands][CG]: `rq add requirement`, `rq
  add test`, `rq link`, `rq unlink`, `rq move`, `rq remove` and `rq log`. Do not
  add, change or remove links to requirements or tests, files, `##
  Implementation` items, results or `## Status` sections by editing the text.
- Read the structure with `rq links`, `rq backlinks`, `rq list` and `rq tojson`
  rather than by searching the text; `--json` gives a stable shape.

## Writing a requirement

1. State what must be true of the system, not how it is built. One idea per
   statement, each one checkable.
2. Create it under the requirement it helps implement: `rq add requirement
   <parent> "<name>" --statement "<statement>"`. The command picks the id, names
   the file, and links it from the parent.
3. Refine the statement by editing the text when it needs more than a line.

## Decomposing

A requirement is too big for a test when no single, short set of commands can
show that it holds.

1. List its statements.
2. Group them into smaller requirements, each with a narrower scope; a statement
   may also be covered directly by a test.
3. Create each with `rq add requirement` or `rq add test`, or link an existing
   one with `rq link`.
4. Check coverage: every statement is implemented by at least one link. Unlink
   what implements no statement with `rq unlink`.
5. `rq link` refuses a link back up the graph, and a second parent for a
   requirement: link an existing requirement only when it has no parent yet. A
   test may be linked from every requirement it checks. Links in a test are not
   edges, so a test may refer to what it checks, but does not have to.

## Writing a test

1. Create it: `rq add test <requirement> "<name>" --description "<what it
   shows>" --step "<command>"`, one `shell` step per `--step`.
2. Each step is a `###` heading under `## Steps`. Edit the text to use another
   type: `- Type: javascript` with `- File:` and `- Test:`, `- Type: dotnet`
   with `- Project:` and `- Filter:`, or plain text for an instruction an AI
   agent carries out. Prefer the typed steps; an instruction is for what no
   command can check.
3. Steps run in the test's folder, so use paths relative to it, or `cd` within a
   shell line.
4. Make the steps deterministic and reproducible: no network services, clocks or
   random data the steps do not control, and no manual actions. Prefer running
   an existing test filtered to the behavior, e.g. `npm test --
   --test-name-pattern="..."`.
5. `rq test <test>` runs it and records the result in `.rq/E<n> <slug>.md`.
   Record a result established another way with `rq log <test> --status
   PASS|FAIL --note "<how>"`.

## Checking

Run `rq check <path>` after every change, then `rq test <id> --recurse` on the
changed subtree, and `rq coverage <id> --recurse` when the decomposition
changed, so that an agent checks coverage. Fix what they report before
finishing; [requirements-coverage][RC] says how to act on the `## Coverage`
analysis of an incomplete requirement.

[RC]: requirements-coverage.md

[CG]: <../docs/Changing the graph.md>
[RM]: ../docs/Requirements.md
