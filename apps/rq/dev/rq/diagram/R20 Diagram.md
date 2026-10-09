# R20 Diagram

`rq view` serves the graph as a diagram and each document rendered as HTML; the
look of each node shows its state.

## Implementation

- [R21 Border colour][R21]
- [R22 Border style][R22]
- [R23 View server][R23]

[R21]: <R21 Border colour.md>
[R22]: <R22 Border style.md>
[R23]: <R23 View server.md>

## Coverage

R20 is now fully covered. The gap in R20's recorded `## Coverage` analysis is
closed: R23 now states that the server "draws the graph at `/` as a Mermaid
diagram whose nodes open their documents". R20 has two statements, and here is
what covers each part.

**Statement 1: "`rq view` serves the graph as a diagram and each document
rendered as HTML"**

- **"serves the graph as a diagram"** is covered by R23 View server: "draws the
  graph at `/` as a Mermaid diagram whose nodes open their documents". The
  earlier analysis asked for exactly this change to R23, and it is now in place.
  R23 is checked by T17, whose first step looks for the `<pre class="mermaid">`
  block starting `graph LR` and for the diagram's `click` handlers.
- **"each document rendered as HTML"** is covered by R23 View server: "renders
  each `.md` document as HTML whose links to other documents open them rendered,
  and serves only files inside its folder". T17 checks it.

**Statement 2: "the look of each node shows its state"**

A node's state has two parts, its result and its coverage. Each part has its own
sub-requirement:

- **Result** is covered by R21 Border colour: neutral when not run, green when
  passed, red for a failed test, amber for a requirement failing because of what
  it links to. T16 checks it.
- **Coverage** is covered by R22 Border style: solid when complete, dashed when
  incomplete, dotted when never checked, and solid for a test. T16 checks it.

R23 also says the index lists each node with its status and coverage. That is a
second place where a node's state shows, but statement 2 does not depend on it.

No new tests or sub-requirements are needed. The `## Status` section of R20
still says `Coverage: INCOMPLETE` from the earlier check. Recording this verdict
will update it.

## Status

- Result: PASS
- Coverage: COMPLETE
