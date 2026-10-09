# R26 Querying the graph

`rq list`, `rq links`, `rq backlinks` and `rq tojson` print the graph, a
requirement's links and backlinks, as text or JSON, with each node's status.

## Implementation

- [T19 Querying the graph][T19]

[T19]: <../tests/T19 Querying the graph.md>

## Coverage

R26 has one statement: `rq list`, `rq links`, `rq backlinks` and `rq tojson`
print the graph, a requirement's links and its backlinks, as text or JSON, with
each node's status. The only thing it links to is T19, whose four steps run the
four tests of the same names in `src/query.test.ts`. Split into its parts, the
statement is covered like this:

- **`rq list` prints the graph as text or JSON, with status.** Covered by T19's
  step "execList prints every node from the root down, as text or JSON". It
  checks the text output (kind, path and status per line, e.g. `reqs/R1
  Root.md  FAIL`) and the JSON output (`status` and `coverage` fields for each
  node).
- **`rq links` prints a requirement's links, with status.** Covered by T19's
  step "execLinks prints what a requirement links to, missing and other files
  included". It checks the text output `test  tests/T2 Fails.md  NOT RUN`, a
  missing link and an "other" file. It also checks the errors for a file that
  doesn't exist and for a file that isn't a requirement or test.
- **`rq backlinks` prints a document's backlinks, with status.** Covered by
  T19's step "execBacklinks prints the requirements that link to a document". It
  checks the JSON output (`reqs/R2 Part.md` with `status: 'NOT RUN'`). It also
  checks that the text output is empty when nothing in the working folder links
  to the document.
- **`rq tojson` prints the graph as JSON, with status.** Covered by T19's step
  "execToJson prints the graph with the structural fields". It checks `roots`,
  `errors` and a whole node, including `status: 'FAIL'`, and the status of a
  test node.
- **"As text or JSON" for each command.** All three of `list`, `links` and
  `backlinks` send their output through the same `print` function in
  `src/query.ts`, which picks text or JSON from the `json` option. The `list`
  test checks both formats of that function, so `links` and `backlinks` get both
  formats from it.

One small weakness: nothing runs `links` with `--json`, and nothing runs
`backlinks` in text mode with a backlink in the output. Both formats are still
tested through `list`, so I don't count this as a gap. If you want each command
checked directly, add to `execLinks` a `json: true` call that checks the JSON
array, and to `execBacklinks` a text-mode check from the folder that contains
the linking requirement.

The requirement is fully covered by T19.

## Status

- Result: PASS
- Coverage: COMPLETE
