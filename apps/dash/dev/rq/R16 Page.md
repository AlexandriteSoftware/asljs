# R16 Page

One static page, served as written with no build step, shows the tabs of every
loaded project and the cards of the active tab. It is styled with Pico CSS, in
light and dark by prefers-color-scheme, from CSS custom properties, and holds a
screen wake lock while it is visible.

## Implementation

- [T12 Page][T12]
- [R17 Tabs and cards][R17]
- [R18 Layout][R18]
- [R19 Refresh][R19]
- [R20 Renderers][R20]

[T12]: <tests/T12 Page.md>
[R17]: <R17 Tabs and cards.md>
[R18]: <R18 Layout.md>
[R19]: <R19 Refresh.md>
[R20]: <R20 Renderers.md>

## Coverage

R16 is fully covered. Each of its statements is implemented by at least one of
T12, R17, R18, R19 and R20.

"One static page, served as written with no build step" is covered by T12's step
"served as written". That step names the server.test.js test "only the page and
its modules are served, not the configs, the stores, the agents or the tests".
The test requests the page at / and its modules /dash.js, /layout.js and
/renderers/value.js, and expects each to return 200. It then checks that the
bytes served for /, /dash.js and /renderers/value.js are exactly index.html,
dash.js and renderers/value.js on disk. The test's comment says this is the "no
build step" check. It also checks that nothing else (configs, databases, agents,
tests, path traversal) is served, so the page is the one static page. This
closes the gap that R16's previous coverage note reported. That note is now out
of date and should be regenerated.

"Shows the tabs of every loaded project" is covered by R17: the bar shows the
tabs of every project, in config order.

"And the cards of the active tab" is covered by four requirements:

- R17 says which tab is active (the one named in the fragment, otherwise the
  first) and what each card shows.
- R18 places the cards on the grid.
- R19 reads and repaints the active tab's keys.
- R20 draws each card's body.

"Styled with Pico CSS" is covered by T12's step "styling and wake lock". It
checks that index.html loads Pico CSS classless from a CDN.

"In light and dark by prefers-color-scheme, from CSS custom properties" is
covered by the same T12 step. It checks that the colours are custom properties
on :root and that a prefers-color-scheme: dark block redefines them.

"Holds a screen wake lock while it is visible" is covered by the same T12 step.
It checks that dash.js requests a screen wake lock when the page is visible, and
again on visibilitychange.

These do not affect R16's verdict but are worth knowing:

- **Sub-requirements have their own gaps.** R17, R19 and R20 each report
  statements of their own that nothing covers: the "due" countdown, tabs from
  more than one project, the chart history refresh every minute, value parsing,
  and renderer lookup. The verdict here only asks whether the statements of the
  linked requirements cover R16's statements, and they do. Those gaps should be
  closed in R17, R19 and R20 themselves.
- **layout.js is not byte-compared.** The "served as written" test only checks
  that /layout.js returns 200. Adding /layout.js to the byte-equality loop would
  make that step cover every module the page loads.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
