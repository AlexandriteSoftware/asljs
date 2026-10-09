# R20 Renderers

A card's renderer, renderers/<name>.js, draws its value into the card body - the
parsed JSON, or the text when it is not JSON - and escapes what it did not
create. The built-in ones are value, text, chart (a step line or bars over
history, each value held until the next sample), list, status (ok, warn or error
from a status field or a bare word), table and git; params.field selects a field
by a dotted path.

## Implementation

- [T16 Renderers][T16]

[T16]: <tests/T16 Renderers.md>

## Coverage

R20 is fully covered by T16. Since the last analysis, T16 has gained two steps
that point at `src/dash.test.js`: "parsed value" and "lookup by name". Those two
steps cover the gaps the old analysis reported.

- **"A card's renderer, renderers/<name>.js"**: covered by T16's "lookup by
  name" and "parsed value" steps together. The lookup step's test only checks
  that a missing renderer (`missing`) shows the placeholder `no renderer
  "missing"`. The other half, that a card naming an existing renderer is drawn
  by it, comes from the "parsed value" test: it names `value` and `status`, and
  each card body shows what that renderer produces (`12.5`, and the `status
  status-ok` element). With only one of these two steps, this statement would be
  half covered.
- **"draws its value into the card body"**: covered by T16's "parsed value"
  step, which checks `.card-body` of each card. The per-renderer steps (value,
  text, chart, list, status, table, git) also check what is drawn into the body
  they are given.
- **"the parsed JSON, or the text when it is not JSON"**: covered by T16's
  "parsed value" step. `/api/get` returns `{"free":12.5}` for one key and
  `online` for another. The `value` card with `field: free` shows `12.5`, so the
  JSON was parsed. The `status` card shows ok, so the bare word reached the
  renderer as text.
- **"escapes what it did not create"**: covered by T16's "helpers" step (`el`
  escapes by construction) and its "text" step (`<line 2>` comes out as text,
  not as an element).
- **The value renderer**: covered by T16's "value" step.
- **The text renderer**: covered by T16's "text" step.
- **The chart renderer, "a step line or bars over history, each value held until
  the next sample"**: covered by T16's "chart" step. It checks the line holding
  each value until the next sample, one bar per sample, and that the chart asks
  for its history.
- **The list renderer**: covered by T16's "list" step.
- **The status renderer, "ok, warn or error from a status field or a bare
  word"**: covered by T16's "status" step, which checks each of the three states
  from both a field and a bare word. The "parsed value" step adds a bare word
  reaching the renderer through the page.
- **The table renderer**: covered by T16's "table" step.
- **The git renderer**: covered by T16's "git" step.
- **"params.field selects a field by a dotted path"**: covered by T16's "field"
  step (dotted paths, an array index, a missing path, and no field name). The
  "value", "text" and "parsed value" steps also use `field`.

R20's own Coverage section is out of date. It still says nothing covers the
parsing or the lookup, and its Status still reads INCOMPLETE. It should be
rewritten to match T16 as it is now; T16 itself needs no change.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
