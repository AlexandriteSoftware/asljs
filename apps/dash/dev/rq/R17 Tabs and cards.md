# R17 Tabs and cards

The bar shows the tabs of every project in config order; the tab named in the
fragment is active, otherwise the first. Each card shows its label and, in its
label row, its countdown: the time to its key's next run in the largest unit
that fits, due, stale, or nothing for a key without a schedule. A card whose
renderer does not exist shows a placeholder, and the page says when it cannot
read the dashboards or there is no tab.

## Implementation

- [T13 Tabs and cards][T13]

[T13]: <tests/T13 Tabs and cards.md>

## Coverage

R17 is fully covered by T13. The Coverage section in R17 is out of date: all
three gaps it lists have since been closed by changes to T13 and to the tests
T13 names.

- **"The bar shows the tabs of every project in config order"** is covered by
  T13 "tabs and grid". Its fixture now has two projects, `p` and `q`, with tab
  `main` from `p` and tab `second` from `q`. The test checks that the bar lists
  `#main` and then `#second`, in the order the dashboards give them. T13
  "fragment" also checks that the bar has two tabs.
- **"The tab named in the fragment is active"** is covered by T13 "fragment". It
  boots with `#second`, checks that this tab is active, and checks that a change
  of fragment switches to Main.
- **"Otherwise the first"** is covered by T13 "tabs and grid". With no fragment,
  `#main` has the class `tab tab-active`.
- **"Each card shows its label"** is covered by T13 "tabs and grid". It checks
  the `.card-title` text of every card, including the key used as the title when
  a card has no label.
- **"In its label row, its countdown"** is covered by T13 "countdowns". It
  checks that every card matches `.card-label > .card-title + .card-next`, so
  the countdown sits in the label row, after the title.
- **"The time to its key's next run in the largest unit that fits"** is covered
  by T13 "countdowns" and T13 "due and units". The page has three units:
  seconds, minutes and hours. "countdowns" checks `2m` for 125000 ms. "due and
  units" checks `3h`, `45s` and `59m`. The `59m` case shows that hours are not
  used below a full hour.
- **"Due"** is covered by T13 "due and units". It checks the text `due` with the
  class `status-warn`.
- **"Stale"** is covered by T13 "countdowns". It checks the text `stale` with
  the class `status-error`.
- **"Nothing for a key without a schedule"** is covered by T13 "countdowns". It
  checks an empty `.card-next` on the card that has no key.
- **"A card whose renderer does not exist shows a placeholder"** is covered by
  T13 "missing renderer". It checks the placeholder text `no renderer
  "missing"`.
- **"The page says when it cannot read the dashboards"** is covered by T13 "no
  dashboards".
- **"Or there is no tab"** is covered by T13 "no tabs".

One thing to keep in mind: T13 checks that the page keeps the tab order it
receives from `/api/dashboards`. Building that order from the configs, across
projects, happens on the server, so R17's page-level statement is covered here.

The Coverage and Status sections of R17 should be regenerated, because they
still report the old gaps.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
