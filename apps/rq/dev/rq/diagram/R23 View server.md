# R23 View server

The server reloads the graph on every request for `/`, lists the nodes with
their status and coverage, draws the graph at `/` as a Mermaid diagram whose
nodes open their documents, shows the structure errors, renders each `.md`
document as HTML whose links to other documents open them rendered, and serves
only files inside its folder.

## Implementation

- [T17 View server][T17]

[T17]: <../tests/T17 View server.md>

## Coverage

T17 covers every statement of R23, through its two steps in
`apps/rq/src/view.test.ts`:

- **"The server reloads the graph on every request for `/`"**: covered by T17's
  step "execView serves the graph and the rendered documents". After the first
  request, the test rewrites `reqs/R2 Part.md` so its heading becomes `R2
  Renamed`. It then requests `/` again and checks that the page contains `R2
  Renamed`.
- **"lists the nodes with their status and coverage"**: covered by the same
  step.
  - **Status:** the index lists each node with a link, its kind and its status.
    The test checks status values `NOT RUN`, `FAIL` and `PASS`, for example
    `<li><a href="/R2%20Part.md">R2 Part</a> <span class="neutral">(requirement,
    NOT RUN, NOT CHECKED)</span></li>` and `(test, FAIL)`.
  - **Coverage:** shown on the same line (`NOT CHECKED`) and in the diagram's
    dashed stroke style (`stroke-dasharray:2 3`).
  - The second step also checks that a node outside the folder (`Up`) is listed
    with its status.
- **"shows the structure errors"**: covered by T17's step "execView of a file
  serves its folder and shows its problems". The test checks that the page
  contains `<h2>Problems</h2>` followed by `R1 A.md: the link to R9 Gone.md
  points at no file.`
- **"renders each `.md` document as HTML"**: covered by the first step. The test
  requests `/R2%20Part.md`, gets status 200, and checks that the body contains
  `<h1>R2 Part</h1>`.
- **"whose links to other documents open them rendered"**: covered by the first
  step.
  - The rendered R2 keeps the document link as `<a
    href="tests/T2%20Fails.md">T2</a>`. That resolves to a `.md` path on the
    same server, so it is served through the same rendering route.
  - The index's node links (`/tests/T1%20Passes.md`) and the diagram's `click`
    handlers also point at the documents on the server.
- **"serves only files inside its folder"**: covered by the first step.
  - Requests for `/../secret.md` and for the encoded `/%2E%2E/secret.md` both
    return 404, while `secret.md` exists just outside the folder.
  - A file inside the folder (`/pic.png`) is served with `image/png`.
  - A missing file returns 404.

Two things could be stronger, though neither leaves a statement uncovered:

- **Coverage values:** only the `NOT CHECKED` coverage value is shown. A step
  that sets an `OK` or `Fail` `Coverage` in a document's `## Status` and checks
  it appears in the listing would test the "coverage" part more firmly.
- **Rendered link targets:** no step follows a rendered link to a document in a
  subfolder (such as `/tests/T2%20Fails.md`) and checks that it comes back as
  HTML. Adding that request to the first step would test "open them rendered"
  directly.

Every statement is covered by T17.

## Status

- Result: PASS
- Coverage: COMPLETE
