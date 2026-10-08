# requirements-change

Use when: a requirement was added, changed or removed, or the behavior an
evidence shows changed, and the related requirements must be brought in line.

The formats are in [Requirements][RM]; how to write the documents is in
[requirements-authoring][RA].

## Find the related nodes

For the changed requirement:

- parents - the requirements that link to it. Search the requirements folder for
  links to its file name, including link definitions and percent-encoded names.
- children - the requirements and evidence it links to.
- siblings - the other children of its parents, which may now overlap with it or
  leave a gap.

## Update them

1. Parents: check that their statements are still fully covered. When the change
   narrowed the requirement, cover the rest with another requirement or
   evidence; when it widened it, narrow the parent or a sibling so that no
   statement is implemented twice in contradicting ways.
2. Children: check that each still implements a statement of the changed
   requirement. Change the ones that implement an old statement, unlink the ones
   that implement none, and add requirements or evidence for statements nothing
   covers.
3. Evidence: when the behavior changed, update the steps so that they show the
   new behavior. Do not edit `## Log`.
4. Repeat for every node that changed, until a pass changes nothing.
5. A removed requirement: remove the links to it, then check its former parents
   as in step 1, and remove its children that nothing else links to.

## Verify

Run `rq verify <path> --ai` on the root, or on the highest requirement that
changed. Every structure error, failed evidence and uncovered statement is a
remaining inconsistency; fix it or report it with the reason.

[RA]: requirements-authoring.md
[RM]: ../docs/Requirements.md
