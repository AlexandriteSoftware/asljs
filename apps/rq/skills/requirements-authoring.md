# requirements-authoring

Use when: writing a requirement, decomposing one into smaller requirements, or
writing the evidence that shows a requirement holds.

The formats are in [Requirements][RM]. Every requirement is a node of one graph
with a single root, and every node except the root is linked from at least one
requirement.

## Writing a requirement

1. State what must be true of the system, not how it is built. One idea per
   statement, each one checkable.
2. Name the file `<id> <name>.md`, and make the level 1 heading the same text.
   Keep the id scheme the folder already uses.
3. Link it from the requirement it helps implement, so that it is reachable from
   the root.

## Decomposing

A requirement is too big for evidence when no single, short set of commands can
show that it holds.

1. List its statements.
2. Group them into smaller requirements, each with a narrower scope; a statement
   may also be covered directly by evidence.
3. Link each smaller requirement and evidence from the requirement.
4. Check coverage: every statement is implemented by at least one link. A link
   that implements no statement does not belong.
5. Do not link back up: a child never links to an ancestor, or the graph gets a
   cycle. Links in evidence are not edges, so evidence may refer to what it
   supports.

## Writing evidence

1. Describe in a sentence what the evidence shows.
2. Add `## Steps` with a code block of commands. Each line runs on its own, in
   the evidence's folder, so use paths relative to it or `cd` within the line.
3. Make the steps deterministic and reproducible: no network services, clocks or
   random data the steps do not control, and no manual actions. Prefer running
   an existing test filtered to the behavior, e.g. `npm test --
   --test-name-pattern="..."`.
4. Leave `## Log` to `rq verify`; do not write entries by hand.

## Checking

Run `rq verify <path>` on the changed subtree, and `rq verify <path> --ai` when
the decomposition changed, so that an agent checks coverage. Fix the structure
errors and failures it reports before finishing.

[RM]: ../docs/Requirements.md
