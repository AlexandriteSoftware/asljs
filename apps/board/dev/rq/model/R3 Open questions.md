# R3 Open questions

What is not settled goes in a document's `## Open questions` section, one list
item per question, which the user answers with a nested `- Answer:` item. A
question without an answer is open, and the open questions are counted.

## Implementation

- [T2 Open questions][T2]

[T2]: <../tests/T2 Open questions.md>

## Coverage

R3 is fully covered. It has no sub-requirements; its only link is T2. I judged
coverage from what T2's two JavaScript steps (in questions.test.js) actually
assert, not just from their titles.

- **Unsettled matters go in a document's Open questions section, one list item
  per question.** Covered by T2's step "addQuestions adds to the Open questions
  section, or adds the section". It adds questions to an existing section,
  keeping the section that follows it. It adds the section when the document has
  none, and fills a section that is empty. Each question becomes one list item,
  and a question written over several lines is joined into one item. Adding no
  questions leaves the document unchanged.
- **The user answers with a nested Answer item.** Covered by T2's step
  "readQuestions reads each question and its answer". It reads a question with a
  nested Answer item, including an answer that runs over two lines. It also
  checks that list items under a different heading are not read as questions.
- **A question without an answer is open.** Covered by the same readQuestions
  step. It checks that a question with no nested item and a question with an
  empty Answer item both read as having no answer.
- **The open questions are counted.** Covered by the same step. It checks that
  the count is 2 for a section with one answered and two unanswered questions,
  and 0 for a document with no Open questions section.

A small suggestion: T2's own description is brief and doesn't mention that a
question with an empty Answer item counts as open. Saying so in T2 would make
that edge case visible without opening the test source. Coverage is complete
without it.

Verdict: OK — T2 covers every statement of R3.

## Status

- Result: PASS
- Coverage: COMPLETE
