# R12 Ids and documents

A document's id and kind come from its file name, and its subject from its level
1 heading, `# <id> <subject>`, or the file name. A document in another kind's
folder and an id used twice are reported and left out. Commands take a document
by its id, a `.md` name or a path.

## Implementation

- [T1 Documents and ids][T1]

[T1]: <../tests/T1 Documents and ids.md>

## Coverage

R12 is fully covered by its one linked test, T1. Every statement in it maps to
at least one T1 step, and I checked each step against the test code it points
to.

- **"A document's id and kind come from its file name."** The step "parseId and
  getItemId read ideas, plans, tasks and results" covers this. It checks each
  kind:
  - ideas and tasks give the expected id, kind, n and m;
  - a result id gives the result kind;
  - malformed ids are rejected;
  - `getItemId` takes the id from a file name like `Plans/P7 Do it.md` and
    returns null for a file name with no id.
- **"Its subject comes from its level 1 heading, `# <id> <subject>`, or the file
  name."** The step "loadBoard takes the subject from the heading, or from the
  file name without one" covers both cases. A heading's subject overrides the
  file name's, and a file with no heading takes its subject from the file name.
- **"A document in another kind's folder and an id used twice are reported and
  left out."** The step "loadBoard reads the items of each folder, and reports
  misplaced and duplicate ids" covers this. It writes a plan into the Ideas
  folder and a second I19 in a subfolder. It then checks both halves of the
  statement:
  - each one produces a problem message;
  - neither one appears in the loaded items.
- **"Commands take a document by its id, a `.md` name or a path."** The step
  "findItem takes an id, a .md name or a path, and itemsOf groups an idea"
  covers this. All three forms resolve to the same task, and an unknown id gives
  an error. The test calls `findItem` directly rather than a command. That's
  enough, since `findItem` is how commands look documents up, but a maintainer
  should know a command that bypasses it would not be caught here.

T1 also covers things R12 doesn't state: how new items are named, how a subject
is made to fit a file name, how items are sorted, and how `itemsOf` groups an
idea. None of that is needed for R12.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
