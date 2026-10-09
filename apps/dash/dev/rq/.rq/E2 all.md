# E2 all

- Date: 2026-10-09T20:27:27.518Z
- Command: `rq test . --name all`
- Result: PASS - 18 of 18 tests passed
- Commit: 405332b735b761901c2165b2038c3d8263c93c20
- Branch: main
- Changed files:
  - `?? apps/dash/dev/rq/`

## T18 Server

- File: <tests/T18 Server.md>
- Result: PASS - 1 step

```text
[step 1] server as a program
$ node --test --test-reporter=tap --test-name-pattern "server\\.js as a program opens every configured database at startup" ../../../src/server.test.js
TAP version 13
# Subtest: server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
ok 1 - server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
  ---
  duration_ms: 915.9039
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
# duration_ms 1207.0192
```

## T11 Runner

- File: <tests/T11 Runner.md>
- Result: PASS - 7 steps

```text
[step 1] once
$ node --test --test-reporter=tap --test-name-pattern "once runs every counter and puts its stdout, trimmed at the end, to its key" ../../../src/runner.test.js
TAP version 13
# Subtest: once runs every counter and puts its stdout, trimmed at the end, to its key
ok 1 - once runs every counter and puts its stdout, trimmed at the end, to its key
  ---
  duration_ms: 258.3932
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
# duration_ms 553.193
[step 2] failure
$ node --test --test-reporter=tap --test-name-pattern "a counter that exits non-zero records no sample, and the runner logs its exit code" ../../../src/runner.test.js
TAP version 13
# Subtest: a counter that exits non-zero records no sample, and the runner logs its exit code
ok 1 - a counter that exits non-zero records no sample, and the runner logs its exit code
  ---
  duration_ms: 138.821
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
# duration_ms 422.3976
[step 3] sticky
$ node --test --test-reporter=tap --test-name-pattern "an unchanged output is logged as sticky" ../../../src/runner.test.js
TAP version 13
# Subtest: an unchanged output is logged as sticky
ok 1 - an unchanged output is logged as sticky
  ---
  duration_ms: 371.9546
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
# duration_ms 681.1495
[step 4] start
$ node --test --test-reporter=tap --test-name-pattern "on start the runner runs the counters due now and those marked startup, then each minute those due" ../../../src/runner.test.js
TAP version 13
# Subtest: on start the runner runs the counters due now and those marked startup, then each minute those due
ok 1 - on start the runner runs the counters due now and those marked startup, then each minute those due
  ---
  duration_ms: 299.8989
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
# duration_ms 572.951
[step 5] timeout
$ node --test --test-reporter=tap --test-name-pattern "a counter that outruns DASH_TIMEOUT is killed and records no sample" ../../../src/runner.test.js
TAP version 13
# Subtest: a counter that outruns DASH_TIMEOUT is killed and records no sample
ok 1 - a counter that outruns DASH_TIMEOUT is killed and records no sample
  ---
  duration_ms: 3159.9597
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
# duration_ms 3430.5763
[step 6] runner as a program
$ node --test --test-reporter=tap --test-name-pattern "runner\\.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL" ../../../src/runner.test.js
TAP version 13
# Subtest: runner.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL
ok 1 - runner.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL
  ---
  duration_ms: 485.8368
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
# duration_ms 763.1003
[step 7] with the server
$ node --test --test-reporter=tap --test-name-pattern "server\\.js as a program opens every configured database at startup" ../../../src/server.test.js
TAP version 13
# Subtest: server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
ok 1 - server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
  ---
  duration_ms: 932.8653
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
# duration_ms 1232.0238
```

## T12 Page

- File: <tests/T12 Page.md>
- Result: PASS - 2 steps

```text
[step 1] styling and wake lock
All four conditions hold:

- **Pico CSS from a CDN:** `src/index.html:8` loads `pico.classless.min.css` from `https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/`.
- **Colours on `:root`:** `src/index.html:10-31` defines them as custom properties: `--paper`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`, `--signal`, `--warn` and `--rule`.
- **Dark mode:** `src/index.html:33-46` has a `@media (prefers-color-scheme: dark)` block that sets those same properties again on `:root`.
- **Wake lock:** in `src/dash.js`, `requestWakeLock` (line 302) asks for a `'screen'` wake lock only when `document.visibilityState === 'visible'`. `boot()` calls it at line 345 and adds it as the `visibilitychange` listener at line 362.

{"result":"OK","message":""}
[step 2] served as written
$ node --test --test-reporter=tap --test-name-pattern "only the page and its modules are served, not the configs, the stores, the agents or the tests" ../../../src/server.test.js
TAP version 13
# Subtest: only the page and its modules are served, not the configs, the stores, the agents or the tests
ok 1 - only the page and its modules are served, not the configs, the stores, the agents or the tests
  ---
  duration_ms: 111.1377
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
# duration_ms 377.1893
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
  duration_ms: 1153.549
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
# duration_ms 1690.4195
[step 2] dirty
$ node --test --test-reporter=tap --test-name-pattern "git counts staged, changed and untracked entries and commits to push, as warn" ../../../agents/git.test.js
TAP version 13
# Subtest: git counts staged, changed and untracked entries and commits to push, as warn
ok 1 - git counts staged, changed and untracked entries and commits to push, as warn
  ---
  duration_ms: 1287.1937
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
# duration_ms 1786.1003
[step 3] no upstream
$ node --test --test-reporter=tap --test-name-pattern "git says no upstream, and has no commit before the first one" ../../../agents/git.test.js
TAP version 13
# Subtest: git says no upstream, and has no commit before the first one
ok 1 - git says no upstream, and has no commit before the first one
  ---
  duration_ms: 619.6281
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
# duration_ms 1126.8146
[step 4] not a repository
$ node --test --test-reporter=tap --test-name-pattern "git exits non-zero outside a repository, so the runner records nothing" ../../../agents/git.test.js
TAP version 13
# Subtest: git exits non-zero outside a repository, so the runner records nothing
ok 1 - git exits non-zero outside a repository, so the runner records nothing
  ---
  duration_ms: 747.0683
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
# duration_ms 1265.4482
```

## T1 Keys

- File: <tests/T1 Keys.md>
- Result: PASS - 5 steps

```text
[step 1] isKey
$ node --test --test-reporter=tap --test-name-pattern "isKey accepts letters, digits, dot, dash and underscore only" ../../../src/config.test.js
TAP version 13
# Subtest: isKey accepts letters, digits, dot, dash and underscore only
ok 1 - isKey accepts letters, digits, dot, dash and underscore only
  ---
  duration_ms: 1.0736
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
# duration_ms 140.8631
[step 2] undeclared key
$ node --test --test-reporter=tap --test-name-pattern "a key no counter declares belongs to the first project, with its default policy" ../../../src/config.test.js
TAP version 13
# Subtest: a key no counter declares belongs to the first project, with its default policy
ok 1 - a key no counter declares belongs to the first project, with its default policy
  ---
  duration_ms: 12.5064
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
# duration_ms 149.4596
[step 3] undeclared key stored
$ node --test --test-reporter=tap --test-name-pattern "a key no counter declares is stored in the first project with the project policy" ../../../src/store.test.js
TAP version 13
# Subtest: a key no counter declares is stored in the first project with the project policy
ok 1 - a key no counter declares is stored in the first project with the project policy
  ---
  duration_ms: 32.9942
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
# duration_ms 173.1607
[step 4] invalid key over HTTP
$ node --test --test-reporter=tap --test-name-pattern "a key outside the key pattern is rejected with 400" ../../../src/server.test.js
TAP version 13
# Subtest: a key outside the key pattern is rejected with 400
ok 1 - a key outside the key pattern is rejected with 400
  ---
  duration_ms: 96.6173
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
# duration_ms 384.2604
[step 5] one owner
$ node --test --test-reporter=tap --test-name-pattern "a project, a key or a tab claimed twice is reported, and the first config keeps it" ../../../src/config.test.js
TAP version 13
# Subtest: a project, a key or a tab claimed twice is reported, and the first config keeps it
ok 1 - a project, a key or a tab claimed twice is reported, and the first config keeps it
  ---
  duration_ms: 23.9401
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
# duration_ms 166.927
```

## T2 Sticky samples

- File: <tests/T2 Sticky samples.md>
- Result: PASS - 4 steps

```text
[step 1] sticky put
$ node --test --test-reporter=tap --test-name-pattern "put is sticky in" ../../../src/store.test.js
TAP version 13
# Subtest: put is sticky in database: an unchanged value bumps seen, a changed one adds a sample
ok 1 - put is sticky in database: an unchanged value bumps seen, a changed one adds a sample
  ---
  duration_ms: 41.4158
  type: 'test'
  ...
# Subtest: put is sticky in memory: an unchanged value bumps seen, a changed one adds a sample
ok 2 - put is sticky in memory: an unchanged value bumps seen, a changed one adds a sample
  ---
  duration_ms: 5.7475
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
# duration_ms 185.8909
[step 2] history
$ node --test --test-reporter=tap --test-name-pattern "is newest first, from since, at most limit" ../../../src/store.test.js
TAP version 13
# Subtest: history in database is newest first, from since, at most limit
ok 1 - history in database is newest first, from since, at most limit
  ---
  duration_ms: 44.3591
  type: 'test'
  ...
# Subtest: history in memory is newest first, from since, at most limit
ok 2 - history in memory is newest first, from since, at most limit
  ---
  duration_ms: 6.192
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
# duration_ms 184.6078
[step 3] never written
$ node --test --test-reporter=tap --test-name-pattern "get and history of a key never written are null and empty" ../../../src/store.test.js
TAP version 13
# Subtest: get and history of a key never written are null and empty
ok 1 - get and history of a key never written are null and empty
  ---
  duration_ms: 36.7179
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
# duration_ms 174.8508
[step 4] freshness by seen
$ node --test --test-reporter=tap --test-name-pattern "next judges freshness by seen: an unchanged report keeps the key waiting though its value is old" ../../../src/server.test.js
TAP version 13
# Subtest: next judges freshness by seen: an unchanged report keeps the key waiting though its value is old
ok 1 - next judges freshness by seen: an unchanged report keeps the key waiting though its value is old
  ---
  duration_ms: 130.9417
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
# duration_ms 408.1459
```

## T3 Sample policy

- File: <tests/T3 Sample policy.md>
- Result: PASS - 12 steps

```text
[step 1] amounts
$ node --test --test-reporter=tap --test-name-pattern "parseAmount reads a number, a case-insensitive suffix and products" ../../../src/samples.test.js
TAP version 13
# Subtest: parseAmount reads a number, a case-insensitive suffix and products
ok 1 - parseAmount reads a number, a case-insensitive suffix and products
  ---
  duration_ms: 1.137
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
# duration_ms 90.6948
[step 2] bad amounts
$ node --test --test-reporter=tap --test-name-pattern "parseAmount rejects a bad number, an unknown unit and anything not above zero" ../../../src/samples.test.js
TAP version 13
# Subtest: parseAmount rejects a bad number, an unknown unit and anything not above zero
ok 1 - parseAmount rejects a bad number, an unknown unit and anything not above zero
  ---
  duration_ms: 1.4383
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
# duration_ms 96.1021
[step 3] policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy reads the store, retention, count and quota" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy reads the store, retention, count and quota
ok 1 - parsePolicy reads the store, retention, count and quota
  ---
  duration_ms: 1.7758
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
# duration_ms 97.6146
[step 4] default policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy defaults to a bounded database policy" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy defaults to a bounded database policy
ok 1 - parsePolicy defaults to a bounded database policy
  ---
  duration_ms: 1.7147
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
# duration_ms 91.2142
[step 5] bad policy
$ node --test --test-reporter=tap --test-name-pattern "parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit" ../../../src/samples.test.js
TAP version 13
# Subtest: parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit
ok 1 - parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit
  ---
  duration_ms: 1.5246
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
# duration_ms 102.2998
[step 6] count
$ node --test --test-reporter=tap --test-name-pattern "keeps at most count samples and drops the oldest first" ../../../src/store.test.js
TAP version 13
# Subtest: database keeps at most count samples and drops the oldest first
ok 1 - database keeps at most count samples and drops the oldest first
  ---
  duration_ms: 43.7977
  type: 'test'
  ...
# Subtest: memory keeps at most count samples and drops the oldest first
ok 2 - memory keeps at most count samples and drops the oldest first
  ---
  duration_ms: 6.5002
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
# duration_ms 181.2709
[step 7] retention
$ node --test --test-reporter=tap --test-name-pattern "expires a sample by when it was last seen, not when it first appeared" ../../../src/store.test.js
TAP version 13
# Subtest: database expires a sample by when it was last seen, not when it first appeared
ok 1 - database expires a sample by when it was last seen, not when it first appeared
  ---
  duration_ms: 40.5353
  type: 'test'
  ...
# Subtest: memory expires a sample by when it was last seen, not when it first appeared
ok 2 - memory expires a sample by when it was last seen, not when it first appeared
  ---
  duration_ms: 6.8594
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
# duration_ms 182.5372
[step 8] quota
$ node --test --test-reporter=tap --test-name-pattern "keeps the values within the quota, but never evicts the newest" ../../../src/store.test.js
TAP version 13
# Subtest: database keeps the values within the quota, but never evicts the newest
ok 1 - database keeps the values within the quota, but never evicts the newest
  ---
  duration_ms: 49.9394
  type: 'test'
  ...
# Subtest: memory keeps the values within the quota, but never evicts the newest
ok 2 - memory keeps the values within the quota, but never evicts the newest
  ---
  duration_ms: 5.0911
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
# duration_ms 188.2256
[step 9] sweep
$ node --test --test-reporter=tap --test-name-pattern "sweep ages out a key nobody writes, in both stores" ../../../src/store.test.js
TAP version 13
# Subtest: sweep ages out a key nobody writes, in both stores
ok 1 - sweep ages out a key nobody writes, in both stores
  ---
  duration_ms: 38.4847
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
# duration_ms 173.0519
[step 10] moved to memory
$ node --test --test-reporter=tap --test-name-pattern "sweep drops the database samples of a key whose policy moved to memory" ../../../src/store.test.js
TAP version 13
# Subtest: sweep drops the database samples of a key whose policy moved to memory
ok 1 - sweep drops the database samples of a key whose policy moved to memory
  ---
  duration_ms: 49.3581
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
# duration_ms 183.6096
[step 11] policy per counter
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 12.8425
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
# duration_ms 150.8717
[step 12] project default
$ node --test --test-reporter=tap --test-name-pattern "a key no counter declares belongs to the first project, with its default policy" ../../../src/config.test.js
TAP version 13
# Subtest: a key no counter declares belongs to the first project, with its default policy
ok 1 - a key no counter declares belongs to the first project, with its default policy
  ---
  duration_ms: 12.8811
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
# duration_ms 147.0938
```

## T4 Databases

- File: <tests/T4 Databases.md>
- Result: PASS - 7 steps

```text
[step 1] db path
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 11.1127
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
# duration_ms 151.4741
[step 2] db default
$ node --test --test-reporter=tap --test-name-pattern "db defaults to DASH_DB, then to dash\\.sqlite beside the config" ../../../src/config.test.js
TAP version 13
# Subtest: db defaults to DASH_DB, then to dash.sqlite beside the config
ok 1 - db defaults to DASH_DB, then to dash.sqlite beside the config
  ---
  duration_ms: 12.2979
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
# duration_ms 150.5956
[step 3] shared file
$ node --test --test-reporter=tap --test-name-pattern "openAll opens each database once, even when two projects name the same file" ../../../src/store.test.js
TAP version 13
# Subtest: openAll opens each database once, even when two projects name the same file
ok 1 - openAll opens each database once, even when two projects name the same file
  ---
  duration_ms: 27.8814
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
# duration_ms 164.7006
[step 4] keys of every database
$ node --test --test-reporter=tap --test-name-pattern "keys lists the keys of every configured database and of memory" ../../../src/store.test.js
TAP version 13
# Subtest: keys lists the keys of every configured database and of memory
ok 1 - keys lists the keys of every configured database and of memory
  ---
  duration_ms: 41.8259
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
# duration_ms 180.0815
[step 5] close
$ node --test --test-reporter=tap --test-name-pattern "close closes every database, and the next use opens it again" ../../../src/store.test.js
TAP version 13
# Subtest: close closes every database, and the next use opens it again
ok 1 - close closes every database, and the next use opens it again
  ---
  duration_ms: 39.015
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
# duration_ms 172.7024
[step 6] database of the project
$ node --test --test-reporter=tap --test-name-pattern "a key is stored in the database of the project whose config declares it" ../../../src/store.test.js
TAP version 13
# Subtest: a key is stored in the database of the project whose config declares it
ok 1 - a key is stored in the database of the project whose config declares it
  ---
  duration_ms: 56.7198
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
# duration_ms 192.2866
[step 7] server as a program
$ node --test --test-reporter=tap --test-name-pattern "server\\.js as a program opens every configured database at startup" ../../../src/server.test.js
TAP version 13
# Subtest: server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
ok 1 - server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
  ---
  duration_ms: 895.6984
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
# duration_ms 1181.3033
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
  duration_ms: 141.9001
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
# duration_ms 431.8453
[step 2] invalid key
$ node --test --test-reporter=tap --test-name-pattern "a key outside the key pattern is rejected with 400" ../../../src/server.test.js
TAP version 13
# Subtest: a key outside the key pattern is rejected with 400
ok 1 - a key outside the key pattern is rejected with 400
  ---
  duration_ms: 102.6128
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
# duration_ms 390.4268
```

## T6 Reading values

- File: <tests/T6 Reading values.md>
- Result: PASS - 5 steps

```text
[step 1] get
$ node --test --test-reporter=tap --test-name-pattern "get answers one key as text and several as JSON, with empty and null for keys never written" ../../../src/server.test.js
TAP version 13
# Subtest: get answers one key as text and several as JSON, with empty and null for keys never written
ok 1 - get answers one key as text and several as JSON, with empty and null for keys never written
  ---
  duration_ms: 129.5359
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
# duration_ms 410.9297
[step 2] meta and history
$ node --test --test-reporter=tap --test-name-pattern "meta answers the keys with their ts and seen, and history the samples newest first" ../../../src/server.test.js
TAP version 13
# Subtest: meta answers the keys with their ts and seen, and history the samples newest first
ok 1 - meta answers the keys with their ts and seen, and history the samples newest first
  ---
  duration_ms: 132.568
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
# duration_ms 434.9002
[step 3] keys
$ node --test --test-reporter=tap --test-name-pattern "keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands" ../../../src/server.test.js
TAP version 13
# Subtest: keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
ok 1 - keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
  ---
  duration_ms: 136.7505
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
# duration_ms 438.4695
[step 4] history limits
$ node --test --test-reporter=tap --test-name-pattern "history answers 500 samples by default and at most 5000" ../../../src/server.test.js
TAP version 13
# Subtest: history answers 500 samples by default and at most 5000
ok 1 - history answers 500 samples by default and at most 5000
  ---
  duration_ms: 137.3552
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
# duration_ms 413.8111
[step 5] keys of every store
$ node --test --test-reporter=tap --test-name-pattern "keys lists the keys of every configured database and of memory" ../../../src/store.test.js
TAP version 13
# Subtest: keys lists the keys of every configured database and of memory
ok 1 - keys lists the keys of every configured database and of memory
  ---
  duration_ms: 38.7893
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
# duration_ms 173.972
```

## T7 Countdown

- File: <tests/T7 Countdown.md>
- Result: PASS - 3 steps

```text
[step 1] next states
$ node --test --test-reporter=tap --test-name-pattern "next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule" ../../../src/server.test.js
TAP version 13
# Subtest: next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule
ok 1 - next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule
  ---
  duration_ms: 119.5197
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
# duration_ms 390.2377
[step 2] next and last run
$ node --test --test-reporter=tap --test-name-pattern "nextRun and lastRun are the next and the last minute a key is due, and null without a schedule" ../../../src/config.test.js
TAP version 13
# Subtest: nextRun and lastRun are the next and the last minute a key is due, and null without a schedule
ok 1 - nextRun and lastRun are the next and the last minute a key is due, and null without a schedule
  ---
  duration_ms: 11.5326
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
# duration_ms 163.1882
[step 3] due and stale
$ node --test --test-reporter=tap --test-name-pattern "next is due up to five seconds after a missed run and stale after that" ../../../src/server.test.js
TAP version 13
# Subtest: next is due up to five seconds after a missed run and stale after that
ok 1 - next is due up to five seconds after a missed run and stale after that
  ---
  duration_ms: 110.7256
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
# duration_ms 398.5798
```

## T8 Dashboards and assets

- File: <tests/T8 Dashboards and assets.md>
- Result: PASS - 3 steps

```text
[step 1] dashboards
$ node --test --test-reporter=tap --test-name-pattern "keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands" ../../../src/server.test.js
TAP version 13
# Subtest: keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
ok 1 - keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands
  ---
  duration_ms: 120.5235
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
# duration_ms 399.1845
[step 2] assets
$ node --test --test-reporter=tap --test-name-pattern "only the page and its modules are served, not the configs, the stores, the agents or the tests" ../../../src/server.test.js
TAP version 13
# Subtest: only the page and its modules are served, not the configs, the stores, the agents or the tests
ok 1 - only the page and its modules are served, not the configs, the stores, the agents or the tests
  ---
  duration_ms: 111.3269
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
# duration_ms 376.1431
[step 3] config errors
$ node --test --test-reporter=tap --test-name-pattern "dashboards reports the errors of the loaded configs" ../../../src/server.test.js
TAP version 13
# Subtest: dashboards reports the errors of the loaded configs
ok 1 - dashboards reports the errors of the loaded configs
  ---
  duration_ms: 90.8332
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
# duration_ms 357.0437
```

## T9 Loading configs

- File: <tests/T9 Loading configs.md>
- Result: PASS - 10 steps

```text
[step 1] command line
$ node --test --test-reporter=tap --test-name-pattern "parseArgs takes every --config, -c and --config=, and reports one without a path" ../../../src/config.test.js
TAP version 13
# Subtest: parseArgs takes every --config, -c and --config=, and reports one without a path
ok 1 - parseArgs takes every --config, -c and --config=, and reports one without a path
  ---
  duration_ms: 2.1183
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
# duration_ms 156.8328
[step 2] fallbacks
$ node --test --test-reporter=tap --test-name-pattern "parseArgs falls back to DASH_CONFIG, then to the package dash\\.config\\.json" ../../../src/config.test.js
TAP version 13
# Subtest: parseArgs falls back to DASH_CONFIG, then to the package dash.config.json
ok 1 - parseArgs falls back to DASH_CONFIG, then to the package dash.config.json
  ---
  duration_ms: 2.4465
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
# duration_ms 158.2963
[step 3] bad command line
$ node --test --test-reporter=tap --test-name-pattern "load reports a --config without a path along with the config errors" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a --config without a path along with the config errors
ok 1 - load reports a --config without a path along with the config errors
  ---
  duration_ms: 12.3941
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
# duration_ms 174.8275
[step 4] a project
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 11.9756
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
# duration_ms 165.9839
[step 5] malformed entries
$ node --test --test-reporter=tap --test-name-pattern "load reports a malformed entry and skips it, and the rest of the file still loads" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a malformed entry and skips it, and the rest of the file still loads
ok 1 - load reports a malformed entry and skips it, and the rest of the file still loads
  ---
  duration_ms: 10.9076
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
# duration_ms 156.4249
[step 6] malformed files
$ node --test --test-reporter=tap --test-name-pattern "a file that does not parse, or has no project or an invalid one, is reported and the other configs still load" ../../../src/config.test.js
TAP version 13
# Subtest: a file that does not parse, or has no project or an invalid one, is reported and the other configs still load
ok 1 - a file that does not parse, or has no project or an invalid one, is reported and the other configs still load
  ---
  duration_ms: 16.8372
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
# duration_ms 202.9594
[step 7] duplicates
$ node --test --test-reporter=tap --test-name-pattern "a project, a key or a tab claimed twice is reported, and the first config keeps it" ../../../src/config.test.js
TAP version 13
# Subtest: a project, a key or a tab claimed twice is reported, and the first config keeps it
ok 1 - a project, a key or a tab claimed twice is reported, and the first config keeps it
  ---
  duration_ms: 32.2939
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
# duration_ms 172.0562
[step 8] reload
$ node --test --test-reporter=tap --test-name-pattern "watch reloads the configs when one changes on disk" ../../../src/config.test.js
TAP version 13
# Subtest: watch reloads the configs when one changes on disk
ok 1 - watch reloads the configs when one changes on disk
  ---
  duration_ms: 129.4644
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
# duration_ms 283.179
[step 9] server as a program
$ node --test --test-reporter=tap --test-name-pattern "server\\.js as a program opens every configured database at startup" ../../../src/server.test.js
TAP version 13
# Subtest: server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
ok 1 - server.js as a program opens every configured database at startup, listens on PORT, and runs the counters with --with-runner
  ---
  duration_ms: 402.2064
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
# duration_ms 669.3014
[step 10] runner as a program
$ node --test --test-reporter=tap --test-name-pattern "runner\\.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL" ../../../src/runner.test.js
TAP version 13
# Subtest: runner.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL
ok 1 - runner.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL
  ---
  duration_ms: 478.3334
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
# duration_ms 740.4936
```

## T10 Counters

- File: <tests/T10 Counters.md>
- Result: PASS - 9 steps

```text
[step 1] counter fields
$ node --test --test-reporter=tap --test-name-pattern "load reports a malformed entry and skips it, and the rest of the file still loads" ../../../src/config.test.js
TAP version 13
# Subtest: load reports a malformed entry and skips it, and the rest of the file still loads
ok 1 - load reports a malformed entry and skips it, and the rest of the file still loads
  ---
  duration_ms: 10.3083
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
# duration_ms 144.1193
[step 2] cron syntax
$ node --test --test-reporter=tap --test-name-pattern "parse expands \\*, lists, ranges and steps per field" ../../../src/cron.test.js
TAP version 13
# Subtest: parse expands *, lists, ranges and steps per field
ok 1 - parse expands *, lists, ranges and steps per field
  ---
  duration_ms: 2.5468
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
# duration_ms 92.3552
[step 3] cron errors
$ node --test --test-reporter=tap --test-name-pattern "parse rejects a wrong field count, a bad step and an out-of-range value" ../../../src/cron.test.js
TAP version 13
# Subtest: parse rejects a wrong field count, a bad step and an out-of-range value
ok 1 - parse rejects a wrong field count, a bad step and an out-of-range value
  ---
  duration_ms: 2.9771
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
# duration_ms 99.5229
[step 4] cron match
$ node --test --test-reporter=tap --test-name-pattern "matches checks the minute, the hour and the day, with 0 and 7 both Sunday" ../../../src/cron.test.js
TAP version 13
# Subtest: matches checks the minute, the hour and the day, with 0 and 7 both Sunday
ok 1 - matches checks the minute, the hour and the day, with 0 and 7 both Sunday
  ---
  duration_ms: 3.1467
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
# duration_ms 96.7707
[step 5] next minute
$ node --test --test-reporter=tap --test-name-pattern "next is the first matching minute strictly after the given time" ../../../src/cron.test.js
TAP version 13
# Subtest: next is the first matching minute strictly after the given time
ok 1 - next is the first matching minute strictly after the given time
  ---
  duration_ms: 3.5441
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
# duration_ms 96.4593
[step 6] sparse schedules
$ node --test --test-reporter=tap --test-name-pattern "next skips the days and hours that cannot match, across months and years" ../../../src/cron.test.js
TAP version 13
# Subtest: next skips the days and hours that cannot match, across months and years
ok 1 - next skips the days and hours that cannot match, across months and years
  ---
  duration_ms: 4.3255
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
# duration_ms 97.4914
[step 7] never
$ node --test --test-reporter=tap --test-name-pattern "next and previous are null for a schedule that never matches" ../../../src/cron.test.js
TAP version 13
# Subtest: next and previous are null for a schedule that never matches
ok 1 - next and previous are null for a schedule that never matches
  ---
  duration_ms: 5.3966
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
# duration_ms 101.3386
[step 8] previous minute
$ node --test --test-reporter=tap --test-name-pattern "previous is the last matching minute at or before the given time" ../../../src/cron.test.js
TAP version 13
# Subtest: previous is the last matching minute at or before the given time
ok 1 - previous is the last matching minute at or before the given time
  ---
  duration_ms: 3.9276
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
# duration_ms 94.4798
[step 9] a valid counter
$ node --test --test-reporter=tap --test-name-pattern "load reads a project, its counters and tabs, resolving db against the config folder" ../../../src/config.test.js
TAP version 13
# Subtest: load reads a project, its counters and tabs, resolving db against the config folder
ok 1 - load reads a project, its counters and tabs, resolving db against the config folder
  ---
  duration_ms: 10.8979
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
# duration_ms 148.6998
```

## T13 Tabs and cards

- File: <tests/T13 Tabs and cards.md>
- Result: PASS - 7 steps

```text
[step 1] tabs and grid
$ node --test --test-reporter=tap --test-name-pattern "the page shows the tabs of every project, the first active, and places its cards on the grid" ../../../src/dash.test.js
TAP version 13
# Subtest: the page shows the tabs of every project, the first active, and places its cards on the grid
ok 1 - the page shows the tabs of every project, the first active, and places its cards on the grid
  ---
  duration_ms: 193.4467
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
# duration_ms 1199.0644
[step 2] fragment
$ node --test --test-reporter=tap --test-name-pattern "the tab in the fragment is shown, and a change of fragment switches tabs" ../../../src/dash.test.js
TAP version 13
# Subtest: the tab in the fragment is shown, and a change of fragment switches tabs
ok 1 - the tab in the fragment is shown, and a change of fragment switches tabs
  ---
  duration_ms: 240.9929
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
# duration_ms 1350.7383
[step 3] countdowns
$ node --test --test-reporter=tap --test-name-pattern "the page reads the values and the countdowns of the active tab, each key once" ../../../src/dash.test.js
TAP version 13
# Subtest: the page reads the values and the countdowns of the active tab, each key once
ok 1 - the page reads the values and the countdowns of the active tab, each key once
  ---
  duration_ms: 186.8473
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
# duration_ms 1247.5404
[step 4] missing renderer
$ node --test --test-reporter=tap --test-name-pattern "a card with a renderer that does not exist shows a placeholder, not an exception" ../../../src/dash.test.js
TAP version 13
# Subtest: a card with a renderer that does not exist shows a placeholder, not an exception
ok 1 - a card with a renderer that does not exist shows a placeholder, not an exception
  ---
  duration_ms: 188.7091
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
# duration_ms 1214.7982
[step 5] no dashboards
$ node --test --test-reporter=tap --test-name-pattern "the page says when it cannot read the dashboards" ../../../src/dash.test.js
TAP version 13
# Subtest: the page says when it cannot read the dashboards
ok 1 - the page says when it cannot read the dashboards
  ---
  duration_ms: 167.3368
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
# duration_ms 1175.224
[step 6] no tabs
$ node --test --test-reporter=tap --test-name-pattern "the page says when no config has a tab" ../../../src/dash.test.js
TAP version 13
# Subtest: the page says when no config has a tab
ok 1 - the page says when no config has a tab
  ---
  duration_ms: 176.1523
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
# duration_ms 1195.2707
[step 7] due and units
$ node --test --test-reporter=tap --test-name-pattern "the page polls the values every five seconds and repaints a card whose value changed" ../../../src/dash.test.js
TAP version 13
# Subtest: the page polls the values every five seconds and repaints a card whose value changed
ok 1 - the page polls the values every five seconds and repaints a card whose value changed
  ---
  duration_ms: 198.5141
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
# duration_ms 1175.3747
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
  duration_ms: 1.8927
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
# duration_ms 95.598
[step 2] anchored
$ node --test --test-reporter=tap --test-name-pattern "layout places anchored cards first and flows the others around them" ../../../src/layout.test.js
TAP version 13
# Subtest: layout places anchored cards first and flows the others around them
ok 1 - layout places anchored cards first and flows the others around them
  ---
  duration_ms: 2.6912
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
# duration_ms 101.3249
[step 3] order
$ node --test --test-reporter=tap --test-name-pattern "layout keeps the cards in the order given, with the card each placement is for" ../../../src/layout.test.js
TAP version 13
# Subtest: layout keeps the cards in the order given, with the card each placement is for
ok 1 - layout keeps the cards in the order given, with the card each placement is for
  ---
  duration_ms: 2.95
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
# duration_ms 106.3193
[step 4] partial anchors
$ node --test --test-reporter=tap --test-name-pattern "layout pins the column of a card with left only, and starts the scan at the row of a card with top only" ../../../src/layout.test.js
TAP version 13
# Subtest: layout pins the column of a card with left only, and starts the scan at the row of a card with top only
ok 1 - layout pins the column of a card with left only, and starts the scan at the row of a card with top only
  ---
  duration_ms: 3.1975
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
# duration_ms 106.9171
[step 5] clamping
$ node --test --test-reporter=tap --test-name-pattern "layout clamps a card wider than the screen, and an anchored card that would overflow" ../../../src/layout.test.js
TAP version 13
# Subtest: layout clamps a card wider than the screen, and an anchored card that would overflow
ok 1 - layout clamps a card wider than the screen, and an anchored card that would overflow
  ---
  duration_ms: 2.8465
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
# duration_ms 105.2152
[step 6] rows
$ node --test --test-reporter=tap --test-name-pattern "layoutRows is the number of rows the placed cards use" ../../../src/layout.test.js
TAP version 13
# Subtest: layoutRows is the number of rows the placed cards use
ok 1 - layoutRows is the number of rows the placed cards use
  ---
  duration_ms: 2.1022
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
# duration_ms 95.3664
[step 7] on the page
$ node --test --test-reporter=tap --test-name-pattern "the page shows the tabs of every project, the first active, and places its cards on the grid" ../../../src/dash.test.js
TAP version 13
# Subtest: the page shows the tabs of every project, the first active, and places its cards on the grid
ok 1 - the page shows the tabs of every project, the first active, and places its cards on the grid
  ---
  duration_ms: 193.3429
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
# duration_ms 1189.1872
```

## T15 Refresh

- File: <tests/T15 Refresh.md>
- Result: PASS - 4 steps

```text
[step 1] values once
$ node --test --test-reporter=tap --test-name-pattern "the page reads the values and the countdowns of the active tab, each key once" ../../../src/dash.test.js
TAP version 13
# Subtest: the page reads the values and the countdowns of the active tab, each key once
ok 1 - the page reads the values and the countdowns of the active tab, each key once
  ---
  duration_ms: 204.2849
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
# duration_ms 1219.7661
[step 2] polling
$ node --test --test-reporter=tap --test-name-pattern "the page polls the values every five seconds and repaints a card whose value changed" ../../../src/dash.test.js
TAP version 13
# Subtest: the page polls the values every five seconds and repaints a card whose value changed
ok 1 - the page polls the values every five seconds and repaints a card whose value changed
  ---
  duration_ms: 193.9538
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
# duration_ms 1201.3573
[step 3] unchanged
$ node --test --test-reporter=tap --test-name-pattern "a card whose value did not change is not drawn again" ../../../src/dash.test.js
TAP version 13
# Subtest: a card whose value did not change is not drawn again
ok 1 - a card whose value did not change is not drawn again
  ---
  duration_ms: 189.1324
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
# duration_ms 1192.7454
[step 4] charts
$ node --test --test-reporter=tap --test-name-pattern "a chart card reads its history when the tab is built and again every minute" ../../../src/dash.test.js
TAP version 13
# Subtest: a chart card reads its history when the tab is built and again every minute
ok 1 - a chart card reads its history when the tab is built and again every minute
  ---
  duration_ms: 194.7478
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
# duration_ms 1249.0446
```

## T16 Renderers

- File: <tests/T16 Renderers.md>
- Result: PASS - 13 steps

```text
[step 1] helpers
$ node --test --test-reporter=tap --test-name-pattern "el builds an element whose text is escaped by construction" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: el builds an element whose text is escaped by construction
ok 1 - el builds an element whose text is escaped by construction
  ---
  duration_ms: 87.7069
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
# duration_ms 1080.3995
[step 2] empty
$ node --test --test-reporter=tap --test-name-pattern "clear and empty replace what a card body holds" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: clear and empty replace what a card body holds
ok 1 - clear and empty replace what a card body holds
  ---
  duration_ms: 88.2765
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
# duration_ms 1088.6871
[step 3] field
$ node --test --test-reporter=tap --test-name-pattern "field reads a dotted path, and gives the value itself without a name" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: field reads a dotted path, and gives the value itself without a name
ok 1 - field reads a dotted path, and gives the value itself without a name
  ---
  duration_ms: 0.9779
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
# duration_ms 1024.031
[step 4] numbers
$ node --test --test-reporter=tap --test-name-pattern "formatNumber keeps integers, rounds to two places, or uses the precision given" ../../../src/renderers/util.test.js
TAP version 13
# Subtest: formatNumber keeps integers, rounds to two places, or uses the precision given
ok 1 - formatNumber keeps integers, rounds to two places, or uses the precision given
  ---
  duration_ms: 0.9299
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
# duration_ms 1019.5959
[step 5] value
$ node --test --test-reporter=tap --test-name-pattern "value draws" ../../../src/renderers/value.test.js
TAP version 13
# Subtest: value draws one number with its prefix, unit and precision
ok 1 - value draws one number with its prefix, unit and precision
  ---
  duration_ms: 89.033
  type: 'test'
  ...
# Subtest: value draws a word as it is, and an empty value as no data
ok 2 - value draws a word as it is, and an empty value as no data
  ---
  duration_ms: 18.701
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
# duration_ms 1106.8997
[step 6] text
$ node --test --test-reporter=tap --test-name-pattern text ../../../src/renderers/text.test.js
TAP version 13
# Subtest: text draws preformatted output, escaped, without trailing whitespace
ok 1 - text draws preformatted output, escaped, without trailing whitespace
  ---
  duration_ms: 95.4474
  type: 'test'
  ...
# Subtest: text keeps the last lines with tail, wraps with wrap, and prints an object as JSON
ok 2 - text keeps the last lines with tail, wraps with wrap, and prints an object as JSON
  ---
  duration_ms: 19.3697
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
# duration_ms 1188.5086
[step 7] chart
$ node --test --test-reporter=tap --test-name-pattern chart ../../../src/renderers/chart.test.js
TAP version 13
# Subtest: chart asks for its history, and steps each value forward to the next sample
ok 1 - chart asks for its history, and steps each value forward to the next sample
  ---
  duration_ms: 117.0293
  type: 'test'
  ...
# Subtest: chart draws a bar per sample with kind bar
ok 2 - chart draws a bar per sample with kind bar
  ---
  duration_ms: 13.6862
  type: 'test'
  ...
# Subtest: chart draws no history without numbers, a history, or when it fails
ok 3 - chart draws no history without numbers, a history, or when it fails
  ---
  duration_ms: 8.7238
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
# duration_ms 1134.3927
[step 8] list
$ node --test --test-reporter=tap --test-name-pattern list ../../../src/renderers/list.test.js
TAP version 13
# Subtest: list draws a row per item, its label and the other fields that are set
ok 1 - list draws a row per item, its label and the other fields that are set
  ---
  duration_ms: 107.5815
  type: 'test'
  ...
# Subtest: list limits the rows and says how many more there are
ok 2 - list limits the rows and says how many more there are
  ---
  duration_ms: 14.1866
  type: 'test'
  ...
# Subtest: list draws its empty message for no rows
ok 3 - list draws its empty message for no rows
  ---
  duration_ms: 7.0827
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
# duration_ms 1190.2412
[step 9] status
$ node --test --test-reporter=tap --test-name-pattern status ../../../src/renderers/status.test.js
TAP version 13
# Subtest: statusOf reads ok, warn and error from a status field or a bare word
ok 1 - statusOf reads ok, warn and error from a status field or a bare word
  ---
  duration_ms: 0.8611
  type: 'test'
  ...
# Subtest: status draws the word coloured by its state, and the message
ok 2 - status draws the word coloured by its state, and the message
  ---
  duration_ms: 87.6061
  type: 'test'
  ...
# Subtest: status takes its word from labels, and is unknown for a word it does not know
ok 3 - status takes its word from labels, and is unknown for a word it does not know
  ---
  duration_ms: 16.7652
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
# duration_ms 1105.3616
[step 10] table
$ node --test --test-reporter=tap --test-name-pattern table ../../../src/renderers/table.test.js
TAP version 13
# Subtest: table draws the fields of the first row as columns when none are given
ok 1 - table draws the fields of the first row as columns when none are given
  ---
  duration_ms: 97.3145
  type: 'test'
  ...
# Subtest: table takes columns as names or as fields with labels, and limits the rows
ok 2 - table takes columns as names or as fields with labels, and limits the rows
  ---
  duration_ms: 18.5874
  type: 'test'
  ...
# Subtest: table draws its empty message for no rows
ok 3 - table draws its empty message for no rows
  ---
  duration_ms: 7.5479
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
# duration_ms 1141.1294
[step 11] git
$ node --test --test-reporter=tap --test-name-pattern git ../../../src/renderers/git.test.js
TAP version 13
# Subtest: git draws the branch, the commit, the remote position and clean
ok 1 - git draws the branch, the commit, the remote position and clean
  ---
  duration_ms: 95.8001
  type: 'test'
  ...
# Subtest: git marks a dirty commit with +, and draws a row per kind of pending change
ok 2 - git marks a dirty commit with +, and draws a row per kind of pending change
  ---
  duration_ms: 19.1284
  type: 'test'
  ...
# Subtest: git says when there is no upstream, and draws a missing or bare value as a message
ok 3 - git says when there is no upstream, and draws a missing or bare value as a message
  ---
  duration_ms: 7.9918
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
# duration_ms 1135.5978
[step 12] parsed value
$ node --test --test-reporter=tap --test-name-pattern "a renderer gets the value parsed when it is JSON, and as text when it is not" ../../../src/dash.test.js
TAP version 13
# Subtest: a renderer gets the value parsed when it is JSON, and as text when it is not
ok 1 - a renderer gets the value parsed when it is JSON, and as text when it is not
  ---
  duration_ms: 186.3679
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
# duration_ms 1213.5267
[step 13] lookup by name
$ node --test --test-reporter=tap --test-name-pattern "a card with a renderer that does not exist shows a placeholder, not an exception" ../../../src/dash.test.js
TAP version 13
# Subtest: a card with a renderer that does not exist shows a placeholder, not an exception
ok 1 - a card with a renderer that does not exist shows a placeholder, not an exception
  ---
  duration_ms: 191.2124
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
# duration_ms 1205.5159
```
