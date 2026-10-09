# R19 Refresh

Every five seconds the page reads the values and the countdowns of the active
tab's keys, each key once, and repaints the cards whose value changed; chart
cards read their history again every minute.

## Implementation

- [T15 Refresh][T15]

[T15]: <tests/T15 Refresh.md>

## Coverage

R19 is fully covered by T15. The Coverage section inside R19 is out of date: it
says the chart refresh and the "unchanged card" half of the repaint statement
are untested. T15 now has the steps "unchanged" and "charts" for those, and the
four tests behind its steps are in `src/dash.test.js`.

- **"Every five seconds the page reads the values and the countdowns of the
  active tab's keys"** is covered by the T15 step "polling". Its test advances
  the mocked interval 5000 ms twice. After the first tick it checks the new
  value (`42%`) and the new countdowns (`due`, `3h`). After the second it checks
  the countdowns again (`45s`, `59m`), so the polling repeats rather than firing
  once. The step "values once" confirms that the request is built from the
  active tab's keys: `/api/get/a.value,a.text` and `/api/next/a.value,a.text`
  for the tab "main", whose project is p.
- **"each key once"** is covered by the T15 step "values once". The tab has
  `a.value` on two cards. The test checks that the requests are exactly
  `/api/get/a.value,a.text` and `/api/next/a.value,a.text`, with `a.value`
  listed once, and that both cards show the value (`41%` and `41`).
- **"repaints the cards whose value changed"**:
  - The T15 step "polling" covers the positive half: the card whose value went
    from 41 to 42 shows `42%` after the tick.
  - The T15 step "unchanged" covers the negative half. Its test keeps the
    `.hero-number` element of a card whose value stays the same, advances 5000
    ms, and checks that the same element is still in the document, so the card
    was not drawn again.
- **"chart cards read their history again every minute"** is covered by the T15
  step "charts". Its test sets up a chart card and checks that the history is
  read once when the tab is built. The count is still one after 5000 ms and
  becomes two at 60000 ms. That shows the history follows a one-minute schedule
  and is not read on every five-second poll.

Two small suggestions; neither is needed for coverage:

- The Coverage and Status sections of R19 should be regenerated so they stop
  reporting gaps that are now closed.
- The "charts" test only counts history requests. It does not check that the
  chart is redrawn with the new samples. R19 only says the history is read
  again, so this goes beyond the requirement.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
