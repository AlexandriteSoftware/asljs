# R14 Counters

A counter declares a key with a schedule and a command, which go together, an
optional startup flag, which needs both, and an optional sample policy; a
counter with neither schedule nor command only carries a policy. The schedule is
a five-field cron expression with *, lists, ranges and steps, in local time,
where day of week 0 and 7 are both Sunday.

## Implementation

- [T10 Counters][T10]

[T10]: <tests/T10 Counters.md>

## Coverage

R14 is fully covered. T10 now has a step called "a valid counter", which closes
the gap that R14's own Coverage section still reports. That section and its
INCOMPLETE status are out of date.

- **A counter declares a key with a schedule and a command, which go together.**
  T10 "counter fields" rejects a bad key (`bad key!`) and rejects `c.half`,
  which has only a schedule, with "needs both schedule and command". `c.good`
  has both and is the only scheduled counter. T10 "a valid counter" loads
  `site.ping` and checks that its key, schedule and command are kept.
- **An optional startup flag.** T10 "a valid counter" loads `site.ping` with
  `startup: true` and asserts that the flag is still `true` after loading.
  `site.manual` has no flag and loads without error, so the flag is optional.
- **The startup flag needs both schedule and command.** T10 "counter fields"
  rejects `c.startup.manual`, which has `startup: true` but no schedule or
  command, with "startup needs a schedule and command". It also rejects the
  non-boolean `c.startup`.
- **An optional sample policy.** T10 "a valid counter" asserts that
  `policyFor('site.ping')` returns that counter's own `database, 2h, 20, 2Kb`
  policy, not the project's. It also asserts that `site.manual`, which declares
  no policy, gets the project's policy.
- **A counter with neither schedule nor command only carries a policy.** In T10
  "a valid counter", `site.manual` is not scheduled but still has a policy. T10
  "counter fields" shows the same for `c.policy`, which is not in `scheduled()`
  but still gets a policy from `policyFor`.
- **The schedule is a five-field cron expression.** T10 "cron errors" rejects a
  four-field expression. T10 "counter fields" reports `c.cron` with "expected 5
  cron fields, got 3".
- **Written with \*, lists, ranges and steps.** T10 "cron syntax" expands `*/15
  1-3,22 1 */6 1-5` and `10/20` field by field, which covers all four forms. T10
  "cron errors" covers a bad step and out-of-range values.
- **In local time.** T10 "cron match", "next minute", "sparse schedules",
  "never" and "previous minute" all build their dates with the local `Date`
  constructor and check local minutes, hours and days.
- **Day of week 0 and 7 are both Sunday.** T10 "cron match" checks that `0 0 * *
  0` and `0 0 * * 7` both match Sunday 2026-10-11, and that `7` does not match
  the Monday after.

The requirement does not need to change, but its Coverage and Status sections
should be regenerated. They still say that no T10 step shows a valid counter.

## Status

- Result: PASS
- Coverage: COMPLETE
