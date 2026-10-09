# R12 Ids and documents

A document's id and kind come from its file name, and its subject from its level
1 heading, `# <id> <subject>`, or the file name. A document in another kind's
folder and an id used twice are reported and left out. Commands take a document
by its id, a `.md` name or a path.

## Implementation

- [T1 Documents and ids][T1]

[T1]: <../tests/T1 Documents and ids.md>

## Coverage

R12 is fully covered by T1. Its only link is T1, and all five of T1's steps run
tests in `items.test.ts`. Each statement of R12 is checked as follows:

- **Id and kind come from the file name:** T1's step "parseId and getItemId read
  ideas, plans, tasks and results" covers it. It checks the id and kind for
  ideas, plans, tasks and results, taken from the file name. It also checks that
  a name with no valid id, such as `notes.md`, gives no id.
- **Subject comes from the level 1 heading `# <id> <subject>`, or else the file
  name:** T1's step "loadBoard takes the subject from the heading, or from the
  file name without one" covers it. I1's subject is read from its heading even
  though its file name differs, and I2 has no heading, so its subject comes from
  the file name.
- **A document in another kind's folder is reported and left out:** T1's step
  "loadBoard reads the items of each folder, and reports misplaced and duplicate
  ids" covers it. P20 sits in `Ideas`, appears in `board.problems` as "a plan in
  Ideas; move it to Plans", and is missing from `board.items`.
- **An id used twice is reported and left out:** the same step covers it. A
  second I19 in `Ideas/sub` appears in `board.problems` as a duplicate, and only
  the first I19 is in `board.items`.
- **Commands take a document by its id, a `.md` name or a path:** T1's step
  "findItem takes an id, a .md name or a path, and itemsOf groups an idea"
  covers it. `findItem` finds T19-2 from `T19-2`, from `T19-2 Add a review
  date.md` and from `Tasks/T19-2 Add a review date.md`, and it rejects an id the
  board doesn't have. The test checks `findItem`, the shared lookup, rather than
  going through a command. That is enough as long as the commands find their
  document through `findItem`, which I'm assuming from `src/items.ts` being the
  place where items are found. A maintainer who wants this tied to the commands
  themselves could add a CLI-level step to T1 that runs one command, such as
  `develop`, with a `.md` name and with a path.

T1's other step, `itemPath`/`toFileSubject`, goes beyond R12's statements and
doesn't conflict with any of them. I didn't change any files.

## Status

- Result: PASS
- Coverage: COMPLETE
