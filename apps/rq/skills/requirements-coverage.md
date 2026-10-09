# requirements-coverage

Use when: checking whether requirements are fully covered, or closing the gaps
`rq coverage` reports - a requirement whose `Coverage` status is `INCOMPLETE`.

The formats are in [Requirements][RM]; how to write requirements and tests, and
which changes go through the commands, is in [requirements-authoring][RA].

## Check

1. Run `rq coverage <id> --recurse` on the highest requirement that changed, or
   `rq coverage <folder>` for all. An agent judges each requirement and records
   the verdict in `- Coverage:` of its `## Status`, and the reasons in its `##
   Coverage` section. It costs one agent call per requirement, so check what
   changed rather than everything.
2. List what is left: `rq list <folder> --json`, the requirements whose
   `coverage` is `INCOMPLETE` or `null` (never checked).

## Close a gap

For each incomplete requirement, read its `## Coverage` section: it names each
statement nothing covers and what would cover it. Then, as it suggests:

- a missing test - `rq add test <requirement> "<name>" --description "<what it
  shows>"` with steps that check exactly the uncovered statement, then `rq test
  <test>`;
- a missing sub-requirement - `rq add requirement <requirement> "<name>"
  --statement "<statement>"`, then cover the new requirement in turn;
- an existing requirement or test that covers it but is not linked - `rq link
  <requirement> <node>`, keeping one parent per requirement;
- a statement no one should implement, or one stated twice - edit the
  requirement's text so that it says what is meant.

Do not edit `## Coverage` or `## Status` by hand: `rq coverage` rewrites both.
Re-run `rq coverage <id>` on the requirement, and `rq test <id> --recurse` when
tests were added, until it is `COMPLETE`.

## Read a complete verdict

A `COMPLETE` requirement's `## Coverage` says which link covers each statement.
Use it to review the decomposition: a link that covers no statement can be
unlinked, and a statement covered only by a vague test deserves a sharper one.

[RA]: requirements-authoring.md
[RM]: ../docs/Requirements.md
