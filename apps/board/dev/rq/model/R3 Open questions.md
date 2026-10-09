# R3 Open questions

What is not settled goes in a document's `## Open questions` section, one list
item per question, which the user answers with a nested `- Answer:` item. A
question without an answer is open, and the open questions are counted.

## Implementation

- [T2 Open questions][T2]

[T2]: <../tests/T2 Open questions.md>

## Coverage

R3 is fully covered by T2. Both of T2's steps run tests in `questions.test.js`,
built from `src/questions.test.ts`, and together those tests check every
statement of R3.

- **"What is not settled goes in a document's `## Open questions` section, one
  list item per question":** covered by T2's step "addQuestions adds to the Open
  questions section, or adds the section". It checks three cases. The section is
  created at the end of a document that has none. A new item is added after the
  existing list, leaving the following sections alone. An item is added under a
  heading that has no list yet. It also checks that each question becomes
  exactly one list item, even when the question text spans several lines. The
  first step adds that a list in another section (`## Notes`) is not read as
  questions.
- **"which the user answers with a nested `- Answer:` item":** covered by T2's
  step "readQuestions reads each question and its answer". It reads a nested `-
  Answer:` item as the answer, joining an answer that runs over several lines
  into one.
- **"A question without an answer is open":** covered by the same step. A
  question with no nested item, and one with an empty `- Answer:`, both come
  back with no answer, meaning open.
- **"the open questions are counted":** covered by the same step. It also checks
  `countOpen`: 2 for the sample document (two open questions, one answered), and
  0 for a document with no `## Open questions` section. The step's title does
  not mention counting, but T2's description ("read, counted and added") does. A
  maintainer may want to name counting in the step title so the link is visible
  from the requirement side, but that is not needed for coverage.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
