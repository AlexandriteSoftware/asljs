# RQ005 waiting helpers

- `flushMicrotasks()` lets already queued promise callbacks run.
- `waitFor(predicate, timeoutMs)` resolves once the predicate holds, checking
  it after every timer turn, and rejects when the time runs out.
