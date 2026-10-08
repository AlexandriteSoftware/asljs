# requirements-authoring

Use when: writing a requirement, decomposing one into smaller requirements, or
writing the evidence that shows a requirement holds.

The formats are in [Requirements][RM]. Requirements and evidence are nodes of
one graph. A requirement nothing links to is a root; every other node is linked
from at least one requirement.

## Text and structure

- Edit text directly: the statement of a requirement, the description and the
  `## Steps` of an evidence, and any section the commands do not own.
- Change the structure only with the [commands][CG]: `rq add requirement`, `rq
  add evidence`, `rq link`, `rq unlink`, `rq move`, `rq remove` and `rq log`. Do
  not add, change or remove links to requirements or evidence, files, `##
  Implementation` items or `## Log` entries by editing the text.
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

A requirement is too big for evidence when no single, short set of commands can
show that it holds.

1. List its statements.
2. Group them into smaller requirements, each with a narrower scope; a statement
   may also be covered directly by evidence.
3. Create each with `rq add requirement` or `rq add evidence`, or link an
   existing one with `rq link`.
4. Check coverage: every statement is implemented by at least one link. Unlink
   what implements no statement with `rq unlink`.
5. `rq link` refuses a link back up the graph. Links in evidence are not edges,
   so evidence may refer to what it supports.

## Writing evidence

1. Create it: `rq add evidence <requirement> "<name>" --description "<what it
   shows>" --step "<command>"`, one `--step` per command.
2. Each step runs on its own, in the evidence's folder, so use paths relative to
   it or `cd` within the line.
3. Make the steps deterministic and reproducible: no network services, clocks or
   random data the steps do not control, and no manual actions. Prefer running
   an existing test filtered to the behavior, e.g. `npm test --
   --test-name-pattern="..."`.
4. `rq verify` logs every run. Record a result established another way with `rq
   log <evidence> --status Passed|Failed --note "<how>"`.

## Checking

Run `rq check <path>` after every change, then `rq verify <path>` on the changed
subtree, and `rq verify <path> --ai` when the decomposition changed, so that an
agent checks coverage. Fix what they report before finishing.

[CG]: <../docs/Changing the graph.md>
[RM]: ../docs/Requirements.md
