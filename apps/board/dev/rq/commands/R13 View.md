# R13 View

`board view` serves the board in a browser: a column each for Ideas, Plans,
Tasks and Results, read again on every request, with a card per document showing
its status and open questions and opening the document rendered.

## Implementation

- [T9 View][T9]

[T9]: <../tests/T9 View.md>

## Coverage

R13 makes five statements. T9 is its only link, and its single step ("execView
serves the board in columns, and the documents rendered", in `src/view.test.ts`)
covers all five:

- **Serving the board in a browser.** T9 starts `execView` on a free port. It
  checks that the "Serving … at http://127.0.0.1:<port>/" line is printed, then
  fetches the index page over HTTP.
- **One column each for Ideas, Plans, Tasks and Results.** T9 checks that the
  index has the headings "Ideas (2)", "Plans (1)", "Tasks (2)" and "Results
  (1)".
- **The board is read again on every request.** While the server is running, T9
  writes a new idea, I21, and fetches the index again. It checks that the Ideas
  column now shows "Ideas (3)" and has an I21 card.
- **One card per document, showing its status and open questions.** T9 checks
  the full markup of the I19 card, which has status PLANNED. It also checks the
  I20 card, which has status NEW, the `questions` class and the text "1 open
  questions". It checks that a TODO task card appears too.
- **A card opens the document rendered.** T9 checks that each card links to its
  document's path. It fetches `/Tasks/T19-2 Add a review date.md` and checks
  that the response is rendered HTML: a "Board" link back to the index, followed
  by the `<h1>` heading of T19-2.

One small gap: T9 calls `execView` directly, not through the `board view`
command line. The command line only wires `view` to `execView`, and that wiring
belongs to the command-line requirement and test, not to R13. So nothing in R13
is left uncovered.

Verdict: R13 is fully covered by T9.

## Status

- Result: PASS
- Coverage: COMPLETE
