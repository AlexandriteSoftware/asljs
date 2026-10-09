# E1 all

- Date: 2026-10-09T20:11:48.772Z
- Command: `rq test . --name all`
- Result: PASS - 17 of 17 tests passed
- Commit: 405332b735b761901c2165b2038c3d8263c93c20
- Branch: main
- Changed files:
  - `?? apps/dash/dev/rq/`

## T11 Runner

- File: <tests/T11 Runner.md>
- Result: PASS - 5 steps

```text
[step 1] once
$ node --test --test-reporter=tap --test-name-pattern "once runs every counter and puts its stdout, trimmed at the end, to its key" ../../../src/runner.test.js
TAP version 13
# Subtest: once runs every counter and puts its stdout, trimmed at the end, to its key
ok 1 - once runs every counter and puts its stdout, trimmed at the end, to its key
  ---
  duration_ms: 238.5114
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 522.4587
[step 2] failure
$ node --test --test-reporter=tap --test-name-pattern "a counter that exits non-zero records no sample, and the runner logs its exit code" ../../../src/runner.test.js
TAP version 13
# Subtest: a counter that exits non-zero records no sample, and the runner logs its exit code
ok 1 - a counter that exits non-zero records no sample, and the runner logs its exit code
  ---
  duration_ms: 141.8467
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 398.5933
[step 3] sticky
$ node --test --test-reporter=tap --test-name-pattern "an unchanged output is logged as sticky" ../../../src/runner.test.js
TAP version 13
# Subtest: an unchanged output is logged as sticky
ok 1 - an unchanged output is logged as sticky
  ---
  duration_ms: 272.0099
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 556.8838
[step 4] start
$ node --test --test-reporter=tap --test-name-pattern "on start the runner runs the counters due now and those marked startup, and no others" ../../../src/runner.test.js
TAP version 13
# Subtest: on start the runner runs the counters due now and those marked startup, and no others
ok 1 - on start the runner runs the counters due now and those marked startup, and no others
  ---
  duration_ms: 214.6466
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 503.792
[step 5] timeout
$ node --test --test-reporter=tap --test-name-pattern "a counter that outruns DASH_TIMEOUT is killed and records no sample" ../../../src/runner.test.js
TAP version 13
# Subtest: a counter that outruns DASH_TIMEOUT is killed and records no sample
ok 1 - a counter that outruns DASH_TIMEOUT is killed and records no sample
  ---
  duration_ms: 3137.9968
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3402.8122
```

## T12 Page

- File: <tests/T12 Page.md>
- Result: PASS - 1 step

```text
[step 1] styling and wake lock
The step passes. All four checks hold:

- **Pico CSS from a CDN:** `src/index.html:8` loads `https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css`.
- **Colours on `:root`:** `src/index.html:10-31` defines them as custom properties, including `--paper`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`, `--signal`, `--warn` and `--rule`.
- **Dark-mode block:** `src/index.html:33-46` has an `@media (prefers-color-scheme: dark)` block that redefines those properties on `:root`.
- **Wake lock in `dash.js`:** `requestWakeLock` (`src/dash.js:302`) calls `navigator.wakeLock.request('screen')`, but only when `document.visibilityState === 'visible'`. Startup calls it at `src/dash.js:345`, and a `visibilitychange` listener at `src/dash.js:362` calls it again.

{"result":"OK","message":""}
```

## T17 Git agent

- File: <tests/T17 Git agent.md>
- Result: PASS - 4 steps

```text
[step 1] clean
$ node --test --test-reporter=tap --test-name-pattern "git reports a clean, pushed working folder as ok" ../../../agents/git.test.js
TAP version 13
# Subtest: git reports a clean, pushed working folder as ok
ok 1 - git reports a clean, pushed working folder as ok
  ---
  duration_ms: 1173.8836
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1683.9175
[step 2] dirty
$ node --test --test-reporter=tap --test-name-pattern "git counts staged, changed and untracked entries and commits to push, as warn" ../../../agents/git.test.js
TAP version 13
# Subtest: git counts staged, changed and untracked entries and commits to push, as warn
ok 1 - git counts staged, changed and untracked entries and commits to push, as warn
  ---
  duration_ms: 1311.4928
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1829.627
[step 3] no upstream
$ node --test --test-reporter=tap --test-name-pattern "git says no upstream, and has no commit before the first one" ../../../agents/git.test.js
TAP version 13
# Subtest: git says no upstream, and has no commit before the first one
ok 1 - git says no upstream, and has no commit before the first one
  ---
  duration_ms: 651.3819
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1229.9379
[step 4] not a repository
$ node --test --test-reporter=tap --test-name-pattern "git exits non-zero outside a repository, so the runner records nothing" ../../../agents/git.test.js
TAP version 13
# Subtest: git exits non-zero outside a repository, so the runner records nothing
ok 1 - git exits non-zero outside a repository, so the runner records nothing
  ---
  duration_ms: 796.4421
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1306.9231
```

## T1 Keys

- File: <tests/T1 Keys.md>
- Result: PASS - 4 steps

```text
[step 1] isKey
$ node --test --test-reporter=tap --test-name-pattern "isKey accepts letters, digits, dot, dash and underscore only" ../../../src/config.test.js
TAP version 13
# Subtest: isKey accepts letters, digits, dot, dash and underscore only
ok 1 - isKey accepts letters, digits, dot, dash and underscore only
  ---
  duration_ms: 1.2353
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 152.8875
[step 2] undeclared key
$ node --test --test-reporter=tap --test-name-pattern "a key no counter declares belongs to the first project, with its default policy" ../../../src/config.test.js
TAP version 13
# Subtest: a key no counter declares belongs to the first project, with its default policy
ok 1 - a key no counter declares belongs to the first project, with its default policy
  ---
  duration_ms: 11.8561
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 153.9573
[step 3] undeclared key stored
$ node --test --test-reporter=tap --test-name-pattern "a key no counter declares is stored in the first project with the project policy" ../../../src/store.test.js
TAP version 13
# Subtest: a key no counter declares is stored in the first project with the project policy
ok 1 - a key no counter declares is stored in the first project with the project policy
  ---
  duration_ms: 24.2504
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 179.189
[step 4] invalid key over HTTP
$ node --test --test-reporter=tap --test-name-pattern "a key outside the key pattern is rejected with 400" ../../../src/server.test.js
TAP version 13
# Subtest: a key outside the key pattern is rejected with 400
ok 1 - a key outside the key pattern is rejected with 400
  ---
  duration_ms: 124.0883
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 448.0319
```

## T2 Sticky samples

- File: <tests/T2 Sticky samples.md>
- Result: PASS - 3 steps

```text
[step 1] sticky put
$ node --test --test-reporter=tap --test-name-pattern "put is sticky in" ../../../src/store.test.js
TAP version 13
# Subtest: put is sticky in database: an unchanged value bumps seen, a changed one adds a sample
ok 1 - put is sticky in database: an unchanged value bumps seen, a changed one adds a sample
  ---
  duration_ms: 42.5013
  type: 'test'
  ...
# Subtest: put is sticky in memory: an unchanged value bumps seen, a changed one adds a sample
ok 2 - put is sticky in memory: an unchanged value bumps seen, a changed one adds a sample
  ---
  duration_ms: 5.8964
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 194.6668
[step 2] history
$ node --test --test-reporter=tap --test-name-pattern "is newest first, from since, at most limit" ../../../src/store.test.js
TAP version 13
# Subtest: history in database is newest first, from since, at most limit
ok 1 - history in database is newest first, from since, at most limit
  ---
  duration_ms: 26.0056
  type: 'test'
  ...
# Subtest: history in memory is newest first, from since, at most limit
ok 2 - history in memory is newest first, from since, at most limit
  ---
  duration_ms: 5.8321
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 174.8329
[step 3] never written
$ node --test --test-reporter=tap --test-name-pattern "get and history of a key never written are null and empty" ../../../src/store.test.js
TAP version 13
# Subtest: get and history of a key never written are null and empty
ok 1 - get and history of a key never written are null and empty
  ---
  duration_ms: 21.3263
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 163.5296
```

## T3 Sample policy

- File: <tests/T3 Sample policy.md>
- Result: PASS - 11 steps

```text
[step 1] amounts
$ node --test --test-reporter=tap --test-name-pattern "parseAmount reads a number, a case-insensitive suffix and products" ../../../src/samples.test.js
TAP version 13
# Subtest: parseAmount reads a number, a case-insensitive suffix and products
ok 1 - parseAmount reads a number, a case-insensitive suffix and products
  ---
  duration_ms: 1.1442
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 101.5127
[step 2] bad amounts
$ node --test --test-reporter=tap --test-name-pattern "parseAmount rejects a bad number, an unknown unit and anything not above zero" ../../../src/samples.test.js
TAP version 13
# Subtest: parseAmount rejects a bad number, an unknown unit and anything not above zero
ok 1 - parseAmount rejects a bad number, an unknown unit and anything not above zero
  ---
  duration_ms: 1.4935
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 100.4596
[step 3] policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy reads the store, retention, count and quota" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy reads the store, retention, count and quota
ok 1 - parsePolicy reads the store, retention, count and quota
  ---
  duration_ms: 1.9436
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 95.0896
[step 4] default policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy defaults to a bounded database policy" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy defaults to a bounded database policy
ok 1 - parsePolicy defaults to a bounded database policy
  ---
  duration_ms: 1.7563
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 96.3286
[step 5] bad policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit
ok 1 - parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit
  ---
  duration_ms: 1.4854
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 96.2838
[step 6] count
$ node --test --test-reporter=tap --test-name-pattern "keeps at most count samples and drops the oldest first" ../../../src/store.test.js
TAP version 13
# Subtest: database keeps at most count samples and drops the oldest first
ok 1 - database keeps at most count samples and drops the oldest first
  ---
  duration_ms: 45.0753
  type: 'test'
  ...
# Subtest: memory keeps at most count samples and drops the oldest first
ok 2 - memory keeps at most count samples and drops the oldest first
  ---
  duration_ms: 5.6033
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 194.0442
[step 7] retention
$ node --test --test-reporter=tap --test-name-pattern "expires a sample by when it was last seen, not when it first appeared" ../../../src/store.test.js
TAP version 13
# Subtest: database expires a sample by when it was last seen, not when it first appeared
ok 1 - database expires a sample by when it was last seen, not when it first appeared
  ---
  duration_ms: 32.7387
  type: 'test'
  ...
# Subtest: memory expires a sample by when it was last seen, not when it first appeared
ok 2 - memory expires a sample by when it was last seen, not when it first appeared
  ---
  duration_ms: 5.1787
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 175.43
[step 8] quota
$ node --test --test-reporter=tap --test-name-pattern "keeps the values within the quota, but never evicts the newest" ../../../src/store.test.js
TAP version 13
# Subtest: database keeps the values within the quota, but never evicts the newest
ok 1 - database keeps the values within the quota, but never evicts the newest
  ---
  duration_ms: 47.0346
  type: 'test'
  ...
# Subtest: memory keeps the values within the quota, but never evicts the newest
ok 2 - memory keeps the values within the quota, but never evicts the newest
  ---
  duration_ms: 5.4417
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 189.6893
[step 9] sweep
$ node --test --test-reporter=tap --test-name-pattern "sweep ages out a key nobody writes, in both stores" ../../../src/store.test.js
TAP version 13
# Subtest: sweep ages out a key nobody writes, in both stores
ok 1 - sweep ages out a key nobody writes, in both stores
  ---
  duration_ms: 23.5131
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 164.3219
[step 10] moved to memory
$ node --test --test-reporter=tap --test-name-pattern "sweep drops the database samples of a key whose policy moved to memory" ../../../src/store.test.js
TAP version 13
# Subtest: sweep drops the database samples of a key whose policy moved to memory
ok 1 - sweep drops the database samples of a key whose policy moved to memory
  ---
  duration_ms: 48.076
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 198.0663
[step 11] policy per counter
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 11.043
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 158.1651
```

## T4 Databases

- File: <tests/T4 Databases.md>
- Result: PASS - 5 steps

```text
[step 1] db path
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 11.6663
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 154.0385
[step 2] db default
$ node --test --test-reporter=tap --test-name-pattern "db defaults to DASH_DB, then to dash\\.sqlite beside the config" ../../../src/config.test.js
TAP version 13
# Subtest: db defaults to DASH_DB, then to dash.sqlite beside the config
ok 1 - db defaults to DASH_DB, then to dash.sqlite beside the config
  ---
  duration_ms: 14.1788
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 165.3088
[step 3] shared file
$ node --test --test-reporter=tap --test-name-pattern "openAll opens each database once, even when two projects name the same file" ../../../src/store.test.js
TAP version 13
# Subtest: openAll opens each database once, even when two projects name the same file
ok 1 - openAll opens each database once, even when two projects name the same file
  ---
  duration_ms: 37.165
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 202.1404
[step 4] keys of every database
$ node --test --test-reporter=tap --test-name-pattern "keys lists the keys of every configured database and of memory" ../../../src/store.test.js
TAP version 13
# Subtest: keys lists the keys of every configured database and of memory
ok 1 - keys lists the keys of every configured database and of memory
  ---
  duration_ms: 36.5946
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 237.8467
[step 5] close
$ node --test --test-reporter=tap --test-name-pattern "close closes every database, and the next use opens it again" ../../../src/store.test.js
TAP version 13
# Subtest: close closes every database, and the next use opens it again
ok 1 - close closes every database, and the next use opens it again
  ---
  duration_ms: 38.0397
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 230.6856
```

## T5 Writing values

- File: <tests/T5 Writing values.md>
- Result: PASS - 2 steps

```text
[step 1] put
$ node --test --test-reporter=tap --test-name-pattern "PUT, POST and the deprecated set store the body as text, echo it, and say whether it changed" ../../../src/server.test.js
TAP version 13
# Subtest: PUT, POST and the deprecated set store the body as text, echo it, and say whether it changed
ok 1 - PUT, POST and the deprecated set store the body as text, echo it, and say whether it changed
  ---
  duration_ms: 141.2526
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 446.3283
[step 2] invalid key
$ node --test --test-reporter=tap --test-name-pattern "a key outside the key pattern is rejected with 400" ../../../src/server.test.js
TAP version 13
# Subtest: a key outside the key pattern is rejected with 400
ok 1 - a key outside the key pattern is rejected with 400
  ---
  duration_ms: 101.0985
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 405.3591
```

## T6 Reading values

- File: <tests/T6 Reading values.md>
- Result: PASS - 3 steps

```text
[step 1] get
$ node --test --test-reporter=tap --test-name-pattern "get answers one key as text and several as JSON, with empty and null for keys never written" ../../../src/server.test.js
TAP version 13
# Subtest: get answers one key as text and several as JSON, with empty and null for keys never written
ok 1 - get answers one key as text and several as JSON, with empty and null for keys never written
  ---
  duration_ms: 136.6066
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 428.8825
[step 2] meta and history
$ node --test --test-reporter=tap --test-name-pattern "meta answers the keys with their ts and seen, and history the samples newest first" ../../../src/server.test.js
TAP version 13
# Subtest: meta answers the keys with their ts and seen, and history the samples newest first
ok 1 - meta answers the keys with their ts and seen, and history the samples newest first
  ---
  duration_ms: 127.6802
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 416.1647
[step 3] keys
$ node --test --test-reporter=tap --test-name-pattern "keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands" ../../../src/server.test.js
TAP version 13
# Subtest: keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
ok 1 - keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
  ---
  duration_ms: 119.8639
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 411.6913
```

## T7 Countdown

- File: <tests/T7 Countdown.md>
- Result: PASS - 2 steps

```text
[step 1] next states
$ node --test --test-reporter=tap --test-name-pattern "next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule" ../../../src/server.test.js
TAP version 13
# Subtest: next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule
ok 1 - next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule
  ---
  duration_ms: 150.1302
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 461.8237
[step 2] next and last run
$ node --test --test-reporter=tap --test-name-pattern "nextRun and lastRun are the next and the last minute a key is due, and null without a schedule" ../../../src/config.test.js
TAP version 13
# Subtest: nextRun and lastRun are the next and the last minute a key is due, and null without a schedule
ok 1 - nextRun and lastRun are the next and the last minute a key is due, and null without a schedule
  ---
  duration_ms: 13.0095
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 172.2588
```

## T8 Dashboards and assets

- File: <tests/T8 Dashboards and assets.md>
- Result: PASS - 2 steps

```text
[step 1] dashboards
$ node --test --test-reporter=tap --test-name-pattern "keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands" ../../../src/server.test.js
TAP version 13
# Subtest: keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
ok 1 - keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
  ---
  duration_ms: 166.0517
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 591.7964
[step 2] assets
$ node --test --test-reporter=tap --test-name-pattern "only the page and its modules are served, not the configs, the stores, the agents or the tests" ../../../src/server.test.js
TAP version 13
# Subtest: only the page and its modules are served, not the configs, the stores, the agents or the tests
ok 1 - only the page and its modules are served, not the configs, the stores, the agents or the tests
  ---
  duration_ms: 117.9229
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 413.4694
```

## T9 Loading configs

- File: <tests/T9 Loading configs.md>
- Result: PASS - 8 steps

```text
[step 1] command line
$ node --test --test-reporter=tap --test-name-pattern "parseArgs takes every --config, -c and --config=, and reports one without a path" ../../../src/config.test.js
TAP version 13
# Subtest: parseArgs takes every --config, -c and --config=, and reports one without a path
ok 1 - parseArgs takes every --config, -c and --config=, and reports one without a path
  ---
  duration_ms: 2.1945
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 155.5762
[step 2] fallbacks
$ node --test --test-reporter=tap --test-name-pattern "parseArgs falls back to DASH_CONFIG, then to the package dash\\.config\\.json" ../../../src/config.test.js
TAP version 13
# Subtest: parseArgs falls back to DASH_CONFIG, then to the package dash.config.json
ok 1 - parseArgs falls back to DASH_CONFIG, then to the package dash.config.json
  ---
  duration_ms: 2.1678
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 151.3549
[step 3] bad command line
$ node --test --test-reporter=tap --test-name-pattern "load reports a --config without a path along with the config errors" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a --config without a path along with the config errors
ok 1 - load reports a --config without a path along with the config errors
  ---
  duration_ms: 10.2495
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 154.1449
[step 4] a project
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 12.3759
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 158.3004
[step 5] malformed entries
$ node --test --test-reporter=tap --test-name-pattern "load reports a malformed entry and skips it, and the rest of the file still loads" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a malformed entry and skips it, and the rest of the file still loads
ok 1 - load reports a malformed entry and skips it, and the rest of the file still loads
  ---
  duration_ms: 11.0537
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 152.3147
[step 6] malformed files
$ node --test --test-reporter=tap --test-name-pattern "a file that does not parse, or has no valid project, is reported and the other configs still load" ../../../src/config.test.js
TAP version 13
# Subtest: a file that does not parse, or has no valid project, is reported and the other configs still load
ok 1 - a file that does not parse, or has no valid project, is reported and the other configs still load
  ---
  duration_ms: 23.3679
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 161.4395
[step 7] duplicates
$ node --test --test-reporter=tap --test-name-pattern "a project, a key or a tab claimed twice is reported, and the first config keeps it" ../../../src/config.test.js
TAP version 13
# Subtest: a project, a key or a tab claimed twice is reported, and the first config keeps it
ok 1 - a project, a key or a tab claimed twice is reported, and the first config keeps it
  ---
  duration_ms: 29.6905
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 250.4477
[step 8] reload
$ node --test --test-reporter=tap --test-name-pattern "watch reloads the configs when one changes on disk" ../../../src/config.test.js
TAP version 13
# Subtest: watch reloads the configs when one changes on disk
ok 1 - watch reloads the configs when one changes on disk
  ---
  duration_ms: 136.1864
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 324.1102
```

## T10 Counters

- File: <tests/T10 Counters.md>
- Result: PASS - 8 steps

```text
[step 1] counter fields
$ node --test --test-reporter=tap --test-name-pattern "load reports a malformed entry and skips it, and the rest of the file still loads" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a malformed entry and skips it, and the rest of the file still loads
ok 1 - load reports a malformed entry and skips it, and the rest of the file still loads
  ---
  duration_ms: 10.2891
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 150.6071
[step 2] cron syntax
$ node --test --test-reporter=tap --test-name-pattern "parse expands \\*, lists, ranges and steps per field" ../../../src/cron.test.js
TAP version 13
# Subtest: parse expands *, lists, ranges and steps per field
ok 1 - parse expands *, lists, ranges and steps per field
  ---
  duration_ms: 2.6019
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 100.5733
[step 3] cron errors
$ node --test --test-reporter=tap --test-name-pattern "parse rejects a wrong field count, a bad step and an out-of-range value" ../../../src/cron.test.js
TAP version 13
# Subtest: parse rejects a wrong field count, a bad step and an out-of-range value
ok 1 - parse rejects a wrong field count, a bad step and an out-of-range value
  ---
  duration_ms: 2.6783
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 94.014
[step 4] cron match
$ node --test --test-reporter=tap --test-name-pattern "matches checks the minute, the hour and the day, with 0 and 7 both Sunday" ../../../src/cron.test.js
TAP version 13
# Subtest: matches checks the minute, the hour and the day, with 0 and 7 both Sunday
ok 1 - matches checks the minute, the hour and the day, with 0 and 7 both Sunday
  ---
  duration_ms: 3.2218
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 98.4837
[step 5] next minute
$ node --test --test-reporter=tap --test-name-pattern "next is the first matching minute strictly after the given time" ../../../src/cron.test.js
TAP version 13
# Subtest: next is the first matching minute strictly after the given time
ok 1 - next is the first matching minute strictly after the given time
  ---
  duration_ms: 3.5395
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 97.8895
[step 6] sparse schedules
$ node --test --test-reporter=tap --test-name-pattern "next skips the days and hours that cannot match, across months and years" ../../../src/cron.test.js
TAP version 13
# Subtest: next skips the days and hours that cannot match, across months and years
ok 1 - next skips the days and hours that cannot match, across months and years
  ---
  duration_ms: 4.2808
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 97.9203
[step 7] never
$ node --test --test-reporter=tap --test-name-pattern "next and previous are null for a schedule that never matches" ../../../src/cron.test.js
TAP version 13
# Subtest: next and previous are null for a schedule that never matches
ok 1 - next and previous are null for a schedule that never matches
  ---
  duration_ms: 5.3843
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 101.5746
[step 8] previous minute
$ node --test --test-reporter=tap --test-name-pattern "previous is the last matching minute at or before the given time" ../../../src/cron.test.js
TAP version 13
# Subtest: previous is the last matching minute at or before the given time
ok 1 - previous is the last matching minute at or before the given time
  ---
  duration_ms: 4.1955
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 115.3201
```

## T13 Tabs and cards

- File: <tests/T13 Tabs and cards.md>
- Result: PASS - 6 steps

```text
[step 1] tabs and grid
$ node --test --test-reporter=tap --test-name-pattern "the page shows the tabs of every project, the first active, and places its cards on the grid" ../../../src/dash.test.js
TAP version 13
# Subtest: the page shows the tabs of every project, the first active, and places its cards on the grid
ok 1 - the page shows the tabs of every project, the first active, and places its cards on the grid
  ---
  duration_ms: 222.9776
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1357.3327
[step 2] fragment
$ node --test --test-reporter=tap --test-name-pattern "the tab in the fragment is shown, and a change of fragment switches tabs" ../../../src/dash.test.js
TAP version 13
# Subtest: the tab in the fragment is shown, and a change of fragment switches tabs
ok 1 - the tab in the fragment is shown, and a change of fragment switches tabs
  ---
  duration_ms: 214.7689
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1278.1739
[step 3] countdowns
$ node --test --test-reporter=tap --test-name-pattern "the page reads the values and the countdowns of the active tab, each key once" ../../../src/dash.test.js
TAP version 13
# Subtest: the page reads the values and the countdowns of the active tab, each key once
ok 1 - the page reads the values and the countdowns of the active tab, each key once
  ---
  duration_ms: 213.2038
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1283.2235
[step 4] missing renderer
$ node --test --test-reporter=tap --test-name-pattern "a card with a renderer that does not exist shows a placeholder, not an exception" ../../../src/dash.test.js
TAP version 13
# Subtest: a card with a renderer that does not exist shows a placeholder, not an exception
ok 1 - a card with a renderer that does not exist shows a placeholder, not an exception
  ---
  duration_ms: 188.3573
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1299.3442
[step 5] no dashboards
$ node --test --test-reporter=tap --test-name-pattern "the page says when it cannot read the dashboards" ../../../src/dash.test.js
TAP version 13
# Subtest: the page says when it cannot read the dashboards
ok 1 - the page says when it cannot read the dashboards
  ---
  duration_ms: 165.8128
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1158.5996
[step 6] no tabs
$ node --test --test-reporter=tap --test-name-pattern "the page says when no config has a tab" ../../../src/dash.test.js
TAP version 13
# Subtest: the page says when no config has a tab
ok 1 - the page says when no config has a tab
  ---
  duration_ms: 189.9597
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1207.03
```

## T14 Layout

- File: <tests/T14 Layout.md>
- Result: PASS - 7 steps

```text
[step 1] defaults
$ node --test --test-reporter=tap --test-name-pattern "layout gives a card without geometry the default size and flows cards in list order" ../../../src/layout.test.js
TAP version 13
# Subtest: layout gives a card without geometry the default size and flows cards in list order
ok 1 - layout gives a card without geometry the default size and flows cards in list order
  ---
  duration_ms: 2.4347
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 107.0928
[step 2] anchored
$ node --test --test-reporter=tap --test-name-pattern "layout places anchored cards first and flows the others around them" ../../../src/layout.test.js
TAP version 13
# Subtest: layout places anchored cards first and flows the others around them
ok 1 - layout places anchored cards first and flows the others around them
  ---
  duration_ms: 2.6565
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 97.4071
[step 3] order
$ node --test --test-reporter=tap --test-name-pattern "layout keeps the cards in the order given, with the card each placement is for" ../../../src/layout.test.js
TAP version 13
# Subtest: layout keeps the cards in the order given, with the card each placement is for
ok 1 - layout keeps the cards in the order given, with the card each placement is for
  ---
  duration_ms: 2.7493
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 100.9978
[step 4] partial anchors
$ node --test --test-reporter=tap --test-name-pattern "layout pins the column of a card with left only, and starts the scan at the row of a card with top only" ../../../src/layout.test.js
TAP version 13
# Subtest: layout pins the column of a card with left only, and starts the scan at the row of a card with top only
ok 1 - layout pins the column of a card with left only, and starts the scan at the row of a card with top only
  ---
  duration_ms: 2.8142
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 98.7064
[step 5] clamping
$ node --test --test-reporter=tap --test-name-pattern "layout clamps a card wider than the screen, and an anchored card that would overflow" ../../../src/layout.test.js
TAP version 13
# Subtest: layout clamps a card wider than the screen, and an anchored card that would overflow
ok 1 - layout clamps a card wider than the screen, and an anchored card that would overflow
  ---
  duration_ms: 2.9016
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 103.0942
[step 6] rows
$ node --test --test-reporter=tap --test-name-pattern "layoutRows is the number of rows the placed cards use" ../../../src/layout.test.js
TAP version 13
# Subtest: layoutRows is the number of rows the placed cards use
ok 1 - layoutRows is the number of rows the placed cards use
  ---
  duration_ms: 2.1879
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 109.0091
[step 7] on the page
$ node --test --test-reporter=tap --test-name-pattern "the page shows the tabs of every project, the first active, and places its cards on the grid" ../../../src/dash.test.js
TAP version 13
# Subtest: the page shows the tabs of every project, the first active, and places its cards on the grid
ok 1 - the page shows the tabs of every project, the first active, and places its cards on the grid
  ---
  duration_ms: 196.4777
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1256.5042
```

## T15 Refresh

- File: <tests/T15 Refresh.md>
- Result: PASS - 2 steps

```text
[step 1] values once
$ node --test --test-reporter=tap --test-name-pattern "the page reads the values and the countdowns of the active tab, each key once" ../../../src/dash.test.js
TAP version 13
# Subtest: the page reads the values and the countdowns of the active tab, each key once
ok 1 - the page reads the values and the countdowns of the active tab, each key once
  ---
  duration_ms: 197.533
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1244.2283
[step 2] polling
$ node --test --test-reporter=tap --test-name-pattern "the page polls the values every five seconds and repaints a card whose value changed" ../../../src/dash.test.js
TAP version 13
# Subtest: the page polls the values every five seconds and repaints a card whose value changed
ok 1 - the page polls the values every five seconds and repaints a card whose value changed
  ---
  duration_ms: 203.5557
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1235.8742
```

## T16 Renderers

- File: <tests/T16 Renderers.md>
- Result: PASS - 11 steps

```text
[step 1] helpers
$ node --test --test-reporter=tap --test-name-pattern "el builds an element whose text is escaped by construction" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: el builds an element whose text is escaped by construction
ok 1 - el builds an element whose text is escaped by construction
  ---
  duration_ms: 91.0411
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1146.345
[step 2] empty
$ node --test --test-reporter=tap --test-name-pattern "clear and empty replace what a card body holds" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: clear and empty replace what a card body holds
ok 1 - clear and empty replace what a card body holds
  ---
  duration_ms: 89.0522
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1130.118
[step 3] field
$ node --test --test-reporter=tap --test-name-pattern "field reads a dotted path, and gives the value itself without a name" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: field reads a dotted path, and gives the value itself without a name
ok 1 - field reads a dotted path, and gives the value itself without a name
  ---
  duration_ms: 1.015
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1033.7215
[step 4] numbers
$ node --test --test-reporter=tap --test-name-pattern "formatNumber keeps integers, rounds to two places, or uses the precision given" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: formatNumber keeps integers, rounds to two places, or uses the precision given
ok 1 - formatNumber keeps integers, rounds to two places, or uses the precision given
  ---
  duration_ms: 0.9259
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1029.112
[step 5] value
$ node --test --test-reporter=tap --test-name-pattern "value draws" ../../../src/renderers/value.test.js
TAP version 13
# Subtest: value draws one number with its prefix, unit and precision
ok 1 - value draws one number with its prefix, unit and precision
  ---
  duration_ms: 96.324
  type: 'test'
  ...
# Subtest: value draws a word as it is, and an empty value as no data
ok 2 - value draws a word as it is, and an empty value as no data
  ---
  duration_ms: 18.2796
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1142.736
[step 6] text
$ node --test --test-reporter=tap --test-name-pattern text ../../../src/renderers/text.test.js
TAP version 13
# Subtest: text draws preformatted output, escaped, without trailing whitespace
ok 1 - text draws preformatted output, escaped, without trailing whitespace
  ---
  duration_ms: 100.7656
  type: 'test'
  ...
# Subtest: text keeps the last lines with tail, wraps with wrap, and prints an object as JSON
ok 2 - text keeps the last lines with tail, wraps with wrap, and prints an object as JSON
  ---
  duration_ms: 19.5573
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1152.2058
[step 7] chart
$ node --test --test-reporter=tap --test-name-pattern chart ../../../src/renderers/chart.test.js
TAP version 13
# Subtest: chart asks for its history, and steps each value forward to the next sample
ok 1 - chart asks for its history, and steps each value forward to the next sample
  ---
  duration_ms: 111.8977
  type: 'test'
  ...
# Subtest: chart draws a bar per sample with kind bar
ok 2 - chart draws a bar per sample with kind bar
  ---
  duration_ms: 15.095
  type: 'test'
  ...
# Subtest: chart draws no history without numbers, a history, or when it fails
ok 3 - chart draws no history without numbers, a history, or when it fails
  ---
  duration_ms: 15.9204
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1170.3105
[step 8] list
$ node --test --test-reporter=tap --test-name-pattern list ../../../src/renderers/list.test.js
TAP version 13
# Subtest: list draws a row per item, its label and the other fields that are set
ok 1 - list draws a row per item, its label and the other fields that are set
  ---
  duration_ms: 99.7148
  type: 'test'
  ...
# Subtest: list limits the rows and says how many more there are
ok 2 - list limits the rows and says how many more there are
  ---
  duration_ms: 21.2476
  type: 'test'
  ...
# Subtest: list draws its empty message for no rows
ok 3 - list draws its empty message for no rows
  ---
  duration_ms: 7.7313
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1175.9044
[step 9] status
$ node --test --test-reporter=tap --test-name-pattern status ../../../src/renderers/status.test.js
TAP version 13
# Subtest: statusOf reads ok, warn and error from a status field or a bare word
ok 1 - statusOf reads ok, warn and error from a status field or a bare word
  ---
  duration_ms: 0.9546
  type: 'test'
  ...
# Subtest: status draws the word coloured by its state, and the message
ok 2 - status draws the word coloured by its state, and the message
  ---
  duration_ms: 95.5669
  type: 'test'
  ...
# Subtest: status takes its word from labels, and is unknown for a word it does not know
ok 3 - status takes its word from labels, and is unknown for a word it does not know
  ---
  duration_ms: 9.1529
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1150.77
[step 10] table
$ node --test --test-reporter=tap --test-name-pattern table ../../../src/renderers/table.test.js
TAP version 13
# Subtest: table draws the fields of the first row as columns when none are given
ok 1 - table draws the fields of the first row as columns when none are given
  ---
  duration_ms: 113.6916
  type: 'test'
  ...
# Subtest: table takes columns as names or as fields with labels, and limits the rows
ok 2 - table takes columns as names or as fields with labels, and limits the rows
  ---
  duration_ms: 13.8904
  type: 'test'
  ...
# Subtest: table draws its empty message for no rows
ok 3 - table draws its empty message for no rows
  ---
  duration_ms: 8.9479
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1166.7768
[step 11] git
$ node --test --test-reporter=tap --test-name-pattern git ../../../src/renderers/git.test.js
TAP version 13
# Subtest: git draws the branch, the commit, the remote position and clean
ok 1 - git draws the branch, the commit, the remote position and clean
  ---
  duration_ms: 90.5371
  type: 'test'
  ...
# Subtest: git marks a dirty commit with +, and draws a row per kind of pending change
ok 2 - git marks a dirty commit with +, and draws a row per kind of pending change
  ---
  duration_ms: 26.8813
  type: 'test'
  ...
# Subtest: git says when there is no upstream, and draws a missing or bare value as a message
ok 3 - git says when there is no upstream, and draws a missing or bare value as a message
  ---
  duration_ms: 8.6138
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1164.5124
```
