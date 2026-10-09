# R24 Structural commands

The structure is read and changed only through commands, which keep every link
valid.

## Implementation

- [R25 Changing the graph][R25]
- [R26 Querying the graph][R26]
- [R27 Checking the graph][R27]
- [R31 Link format][R31]
- [R32 Markdown post-processing][R32]

[R25]: <R25 Changing the graph.md>
[R26]: <R26 Querying the graph.md>
[R27]: <R27 Checking the graph.md>
[R31]: <R31 Link format.md>
[R32]: <R32 Markdown post-processing.md>

## Coverage

R24 has a single statement, "The structure is read and changed only through
commands, which keep every link valid." It splits into three parts, and each is
covered:

- **The structure is read through commands.** R26 Querying the graph covers
  this: `rq list`, `rq links`, `rq backlinks` and `rq tojson` print the graph
  and a requirement's links and backlinks. R27 Checking the graph adds read-only
  inspection: `rq check` reports structure errors and malformed documents.
- **The structure is changed through commands.** R25 Changing the graph covers
  this: `rq add`, `rq link`, `rq unlink`, `rq remove` and `rq move` create,
  link, unlink, delete and move requirements and tests.
- **The commands keep every link valid.** Three requirements cover this:
  - R25 states that the change commands rewrite the links to what they change.
    Its test, T18, checks each case: `remove` deletes the links to a removed
    node, `unlink` removes every link to the child, `move` rewrites the links to
    a moved document and retitles reference links, and `link` refuses
    duplicates, cycles and a second parent.
  - R31 Link format makes the links the commands add well-formed reference
    links, labelled with the target's id and with a number added when the label
    is taken.
  - R32 Markdown post-processing makes sure the files the commands write are
    then post-processed, and reports a failure with a non-zero exit code.

The word "only" in the statement is a usage rule for whoever maintains the
documents. It is not a behaviour of `rq` that a test could check. The text of
the documents is still edited by hand; only the structure goes through the
commands. What can be checked is that commands exist for every structural read
and change, and R25, R26 and R27 together cover that. No sub-requirement or test
needs to be added.

## Status

- Result: PASS
- Coverage: COMPLETE
