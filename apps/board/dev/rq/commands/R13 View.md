# R13 View

`board view` serves the board in a browser: a column each for Ideas, Plans,
Tasks and Results, read again on every request, with a card per document showing
its status and open questions and opening the document rendered.

## Implementation

- [T9 View][T9]

[T9]: <../tests/T9 View.md>

## Coverage

R13 is fully covered by its one test, T9.

- **`board view` serves the board in a browser.** T9 starts the server through
  `execView` on a free port and checks the `Serving … at http://127.0.0.1:…/`
  message. It then fetches the index page over HTTP.
- **A column each for Ideas, Plans, Tasks and Results.** T9 checks that the
  index has the headings Ideas (2), Plans (1), Tasks (2) and Results (1). Those
  counts match the documents in the fixture.
- **Read again on every request.** While the server is running, T9 writes a new
  idea, I21, fetches the index again, and checks that the Ideas column now shows
  3 and includes an I21 card.
- **A card per document.** The column counts match the fixture, and T9 checks
  specific cards for I19, I20 and I21, plus a card with status TODO.
- **The card shows its status.** T9 checks that the I19 card shows PLANNED, the
  I20 card shows NEW, and that a card carries the TODO status class.
- **The card shows its open questions.** T9 checks that the I20 card carries the
  questions class and the text "1 open questions".
- **The card opens the document rendered.** T9 checks that each card links to
  its document's path, such as the I19 and I20 links. It also fetches T19-2's
  document path and checks that the result is rendered HTML: a link back to the
  board followed by the document's heading as an h1.

Every statement of R13 is checked by T9, so no test or sub-requirement needs to
be added.

## Status

- Result: PASS
- Coverage: COMPLETE
