# R10 Countdown

GET /api/next/:keys answers, per key, how it stands against its counter's
schedule: wait with the milliseconds until the next run; due when the last
scheduled minute has passed and the key has not been seen since, with the
milliseconds overdue; stale once that is more than five seconds; null for a key
nothing is scheduled to write.

## Implementation

- [T7 Countdown][T7]

[T7]: <tests/T7 Countdown.md>

## Coverage

R10 is now fully covered. The Coverage section inside R10 says the five-second
line is not tested, but that is out of date: T7 has a third step, "due and
stale", which tests exactly that line.

Here is what covers each statement of R10:

- **GET /api/next/:keys answers, per key:** the "next states" step of T7 covers
  this. It requests `web.every,web.manual` in one call and gets back an object
  with one entry per key.
- **wait, with the milliseconds until the next run:** the "next states" step of
  T7 covers this. After a PUT at 12:00:30 against a schedule that runs every
  minute, the key answers `{ state: 'wait', ms: 30000 }`. The "next and last
  run" step of T7 checks that `nextRun` is the next minute the schedule fires. A
  separate server test that judges freshness by seen also checks that an
  unchanged report counts, but T7 does not link it, so it adds nothing here.
- **due when the last scheduled minute has passed and the key has not been seen
  since, with the milliseconds overdue:** the "next states" step of T7 covers
  this. At 12:00:03, with nothing reported for the 12:00 run, the key answers `{
  state: 'due', ms: 3000 }`. The "next and last run" step checks that `lastRun`
  is the last minute the schedule fired. The "due and stale" step also checks
  due at exactly 5000 ms.
- **stale once that is more than five seconds:** the "due and stale" step of T7
  covers this. The key answers due with 5000 at exactly 12:00:05 and stale with
  5001 one millisecond later. That fixes the threshold at five seconds and
  confirms "more than", not "at least". The "next states" step adds stale
  at 30000.
- **null for a key nothing is scheduled to write:** the "next states" step of T7
  covers this; `web.manual` has no schedule and answers null. The "next and last
  run" step checks that `nextRun` and `lastRun` are null for a key with no
  schedule and for a key no config knows.

Each server test calls `serve`, which loads its config into a fresh temporary
folder and closes the store afterwards. So the PUT in the "next states" test
does not carry over into the "due and stale" test, and the key there really has
not been seen since the 12:00 run.

The people maintaining R10 should regenerate its Coverage and Status sections.
They still say "INCOMPLETE" and recommend the test that now exists as the "due
and stale" step.

## Status

- Result: PASS
- Coverage: COMPLETE
