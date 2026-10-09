# R18 Layout

Cards sit on a grid of 36px steps with as many columns as fit the window. A card
is 6 by 6 steps unless it says otherwise, and no wider than the grid. Cards with
both left and top are placed first, exactly; the others flow in list order into
the first free place scanning row by row, a card with only left keeping its
column and one with only top starting at its row.

## Implementation

- [T14 Layout][T14]

[T14]: <tests/T14 Layout.md>

## Coverage

The requirement R18 is fully covered by T14. I checked each statement against
the tests T14's steps name, in `src/layout.test.js` and `src/dash.test.js`.

"Cards sit on a grid of 36px steps with as many columns as fit the window":
covered by the "on the page" step of T14. The test sets the grid's width to
432px. It then expects the layout of a 12-column grid: a 6-wide card at column
6, and an anchored 4-wide card at column 8. 432 / 36 = 12, so this checks both
the 36px step and that the column count comes from the width. A different step
size would give a different column count and a different layout.

"A card is 6 by 6 steps unless it says otherwise": covered by the "defaults"
step of T14. It checks that `DEFAULT_SIZE` is 6 and that cards without geometry
come out as 6×6. The "anchored" step covers the "unless it says otherwise" part:
cards that give a width and height (4×2) keep them. The "on the page" step
checks both cases on the rendered page.

"…and no wider than the grid": covered by the "clamping" step of T14. A 20-wide
card on an 8-column grid is clamped to 8. An anchored card that would overflow
is moved back inside the grid, and a zero-column grid still gives a width of 1.

"Cards with both left and top are placed first, exactly": covered by the
"anchored" step of T14. The anchored card is second in the list but takes (0,0),
and the card listed before it flows around it to (4,0). The "partial anchors"
step also places a fully anchored card at its exact position.

"The others flow in list order into the first free place scanning row by row":
covered by the "defaults" step of T14. Three default cards on 12 columns land at
(0,0), (6,0) and then the next row at (0,6). The "anchored" step shows
unanchored cards filling the first free place in reading order around an
anchored one. The "order" step checks that the output keeps the input order and
links each placement to its card.

"A card with only left keeping its column and one with only top starting at its
row": covered by the "partial anchors" step of T14. The left-only card stays in
column 0 and is pushed down below the occupied cell. The top-only card starts
its scan at row 1 and lands at (4,1).

A note, not a gap: the page re-runs the layout on a window `resize` event, and
no test checks that. R18 doesn't explicitly require re-layout on resize, so this
doesn't count against coverage. If the maintainers mean "as many columns as fit
the window" to include resizing, they could add a page test that changes the
grid width, sends a resize event, and checks the new positions. Separately, the
"rows" step in T14 (`layoutRows`) tests something R18 doesn't state.

Verdict: every statement of R18 is covered by at least one step of T14.

## Status

- Result: PASS
- Coverage: COMPLETE
