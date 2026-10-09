# R2 Values and samples

A value is the text an agent puts under a key. Every key belongs to one project,
and its samples are kept in that project's store; the newest sample is the key's
current value.

## Implementation

- [R3 Keys][R3]
- [R4 Sticky samples][R4]
- [R5 Sample policy][R5]
- [R6 Databases][R6]

[R3]: <R3 Keys.md>
[R4]: <R4 Sticky samples.md>
[R5]: <R5 Sample policy.md>
[R6]: <R6 Databases.md>

## Coverage

R2 is fully covered. The coverage section in R2 is out of date: the two gaps it
lists were closed when R4 and R6 were reworded, and T4 now has a step for the
second one.

R2 makes four statements.

1. "A value is the text an agent puts under a key." R3 defines what a key is. R4
   defines what a put of a value does: it is sticky, and a changed value adds a
   sample. R5 measures values as text, since its quota counts them in UTF-8
   bytes. T2's "sticky put" step puts string values and reads them back.

2. "Every key belongs to one project." R3 states it: a key belongs to the
   project whose config declares it as a counter, and a key no config declares
   belongs to the first project loaded. R3 also says a key names one value
   across every loaded config, so it cannot belong to two projects. T1's
   "undeclared key" step checks both ownership rules with two configs loaded.

3. "Its samples are kept in that project's store." R6 now states it directly: "a
   key's samples are kept in the database of its project". R5 adds that a key
   whose policy store is memory is kept in the server's process. T4's new step
   "database of the project" tests it in `store.test.js`. That test loads two
   configs with separate files, one.sqlite and two.sqlite, where the second
   config declares `own.key`. It puts `own.key` and an undeclared `loose.key`,
   then opens each file. It asserts that two.sqlite holds only `own.key` and
   one.sqlite holds only `loose.key`. This is the case the old analysis said was
   missing: if a key went to the wrong database, the test would fail. T1's
   "undeclared key stored" step and T4's "shared file" step add the
   first-project and shared-file cases.

4. "The newest sample is the key's current value." R4 now states it in the same
   words: "A key's current value is its newest sample". T2's "sticky put" step
   checks that `get` returns the latest changed value with its ts and seen. T2's
   "never written" step covers the edge case: a key with no samples has a null
   current value.

Every statement of R2 is stated by a linked sub-requirement and checked by a
test those sub-requirements link to. R3 and R5 each record their own coverage
gaps, but none of those gaps touches a statement R2 makes. The coverage text
inside R2 should be refreshed so it no longer reports these two gaps.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
