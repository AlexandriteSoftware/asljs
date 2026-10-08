# requirements-change

Use when: a requirement was added, changed or removed, or the behavior an
evidence shows changed, and the related requirements must be brought in line.

The formats are in [Requirements][RM]; how to write the documents, and which
changes go through the commands, is in [requirements-authoring][RA].

## Find the related nodes

For the changed requirement:

- parents - `rq backlinks <file> --json`;
- children - `rq links <file> --json`;
- siblings - `rq links` of each parent: the other children, which may now
  overlap with it or leave a gap.

## Update them

1. Parents: check that their statements are still fully covered. When the change
   narrowed the requirement, cover the rest with another requirement or evidence
   (`rq add requirement`, `rq add evidence`, `rq link`); when it widened it,
   narrow the text of the parent or a sibling so that no statement is
   implemented twice in contradicting ways.
2. Children: check that each still implements a statement of the changed
   requirement. Edit the text of the ones that implement an old statement, `rq
   unlink` the ones that implement none, and add requirements or evidence for
   statements nothing covers.
3. Evidence: when the behavior changed, edit the steps so that they show the new
   behavior. Leave `## Log` to `rq verify` and `rq log`.
4. Repeat for every node that changed, until a pass changes nothing.
5. A removed requirement: `rq remove <file>`, with `--recursive` to remove what
   only it links to, then check its former parents as in step 1.
6. A renamed or moved requirement: `rq move <file> <destination>`, which
   rewrites the links to it.

## Verify

Run `rq check` and then `rq verify <path> --ai` on the roots, or on the highest
requirement that changed. Every structure error, failed evidence and uncovered
statement is a remaining inconsistency; fix it or report it with the reason.

[RA]: requirements-authoring.md
[RM]: ../docs/Requirements.md
