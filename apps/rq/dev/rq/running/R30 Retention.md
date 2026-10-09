# R30 Retention

The `.rq` folder keeps at most 300 execution files and 50 MB: after each
execution the oldest files beyond either limit are removed, except one that
holds the latest result of a test that still exists, so no status is lost.

## Implementation

- [T26 Retention][T26]

[T26]: <../tests/T26 Retention.md>

## Coverage

R30 is fully covered by T26 alone. Each of its four steps maps to a statement:

- **"keeps at most 300 execution files and 50 MB"**: step 2 (`pruneExecutions
  keeps 300 files and 50 MB by default, and removes by size`) checks that the
  `RETENTION` default is `{ maxFiles: 300, maxBytes: 50 MB }`. `pruneExecutions`
  falls back to `RETENTION` when no limit is passed (`src/results.ts:534`).
  `execTest` and `execLog` pass `io.retention`, which is documented as
  `RETENTION` when absent (`src/io.ts:46`).
- **"the oldest files beyond either limit are removed"**:
  - Step 1 covers the file-count limit. With `maxFiles: 2` and four files, the
    two oldest that are not needed are removed.
  - Step 2 covers the size limit. `maxBytes: 600` and then `maxBytes: 100`
    remove the oldest files by size.
- **"after each execution"**: step 4 (`execTest and execLog remove the oldest
  execution files beyond the retention`) checks that both `rq test` and `rq log`
  prune after recording and report `Removed …`. The removed file is checked to
  be gone from disk.
- **"except one that holds the latest result of a test that still exists"**:
  - Step 1 covers the kept files. With `maxFiles: 1, maxBytes: 1`, nothing more
    is removed because the remaining files hold the latest results of T1 and T2.
    `loadResults` still returns PASS for both, which also shows that "no status
    is lost".
  - Step 3 (`pruneExecutions does not keep the results of tests that no longer
    exist`) covers the other half: a file whose only result belongs to a deleted
    test (`T9 Gone`) is removed.

One small note that doesn't affect the verdict: no test runs `rq test` or `rq
log` without an explicit `retention` to show the 300 / 50 MB defaults are used
end to end. That wiring is a single default parameter (`retention = RETENTION`),
and step 2 already checks the constant, so I'd leave it as it is.

## Status

- Result: PASS
- Coverage: COMPLETE
