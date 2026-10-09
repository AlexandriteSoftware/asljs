# E15 T14 Coverage check

- Date: 2026-10-09T15:45:44.144Z
- Command: `rq test "T14 Coverage check.md"`
- Result: PASS - 1 of 1 tests passed
- Commit: aacb65725ffa6edb536039b75d2bbfa9b278b73c
- Branch: main
- Changed files:
  - `M "apps/rq/dev/rq/tests/T1 Node kinds.md"`
  - `M "apps/rq/dev/rq/tests/T10 Test targets.md"`
  - `M "apps/rq/dev/rq/tests/T11 Execution files.md"`
  - `M "apps/rq/dev/rq/tests/T12 Status recalculation.md"`
  - `M "apps/rq/dev/rq/tests/T13 Manual results.md"`
  - `M "apps/rq/dev/rq/tests/T14 Coverage check.md"`
  - `M "apps/rq/dev/rq/tests/T15 AI agents.md"`
  - `M "apps/rq/dev/rq/tests/T16 Diagram borders.md"`
  - `M "apps/rq/dev/rq/tests/T17 View server.md"`
  - `M "apps/rq/dev/rq/tests/T18 Changing the graph.md"`
  - `M "apps/rq/dev/rq/tests/T19 Querying the graph.md"`
  - `M "apps/rq/dev/rq/tests/T2 Requirement hierarchy.md"`
  - `M "apps/rq/dev/rq/tests/T20 Checking the graph.md"`
  - `M "apps/rq/dev/rq/tests/T21 Working folder.md"`
  - `M "apps/rq/dev/rq/tests/T22 Command line.md"`
  - `M "apps/rq/dev/rq/tests/T23 Command documentation.md"`
  - `M "apps/rq/dev/rq/tests/T24 Edges.md"`
  - `M "apps/rq/dev/rq/tests/T25 Test report.md"`
  - `M "apps/rq/dev/rq/tests/T26 Retention.md"`
  - `M "apps/rq/dev/rq/tests/T27 Link format.md"`
  - `M "apps/rq/dev/rq/tests/T28 Markdown post-processing.md"`
  - `M "apps/rq/dev/rq/tests/T29 Ids and cycles.md"`
  - `M "apps/rq/dev/rq/tests/T3 Tests.md"`
  - `M "apps/rq/dev/rq/tests/T4 Status section.md"`
  - `M "apps/rq/dev/rq/tests/T5 Step types.md"`
  - `M "apps/rq/dev/rq/tests/T6 Shell steps.md"`
  - `M "apps/rq/dev/rq/tests/T7 JavaScript steps.md"`
  - `M "apps/rq/dev/rq/tests/T8 NET steps.md"`
  - `M "apps/rq/dev/rq/tests/T9 Instruction steps.md"`
  - `?? "apps/rq/dev/rq/.rq/E11 T7 T9 T15 T28.md"`
  - `?? "apps/rq/dev/rq/.rq/E12 T9.md"`
  - `?? "apps/rq/dev/rq/.rq/E13 rq.md"`
  - `?? "apps/rq/dev/rq/.rq/E14 rq.md"`

## T14 Coverage check

- File: <tests/T14 Coverage check.md>
- Result: PASS - 7 steps

```text
[step 1] checkCoverage asks the agent about a requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage asks the agent about a requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage asks the agent about a requirement and its links
ok 1 - checkCoverage asks the agent about a requirement and its links
  ---
  duration_ms: 492.0882
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
# duration_ms 770.1815
[step 2] checkCoverage prompt names the requirement and its links
$ node --test --test-reporter=tap --test-name-pattern "checkCoverage prompt names the requirement and its links" ../../../build/coverage.test.js
TAP version 13
# Subtest: checkCoverage prompt names the requirement and its links
ok 1 - checkCoverage prompt names the requirement and its links
  ---
  duration_ms: 167.8608
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
# duration_ms 452.5109
[step 3] execCoverage records the verdict of each selected requirement in its Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage records the verdict of each selected requirement in its Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage records the verdict of each selected requirement in its Status
ok 1 - execCoverage records the verdict of each selected requirement in its Status
  ---
  duration_ms: 500.6688
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
# duration_ms 767.8292
[step 4] execCoverage writes the analysis to the Coverage section, before the Status
$ node --test --test-reporter=tap --test-name-pattern "execCoverage writes the analysis to the Coverage section, before the Status" ../../../build/coverage.test.js
TAP version 13
# Subtest: execCoverage writes the analysis to the Coverage section, before the Status
ok 1 - execCoverage writes the analysis to the Coverage section, before the Status
  ---
  duration_ms: 327.1545
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
# duration_ms 633.0493
[step 5] writeCoverageSection adds the section before the Status, or replaces it
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection adds the section before the Status, or replaces it" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection adds the section before the Status, or replaces it
ok 1 - writeCoverageSection adds the section before the Status, or replaces it
  ---
  duration_ms: 19.5625
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
# duration_ms 291.2069
[step 6] writeCoverageSection replaces the links of the analysis by their text
$ node --test --test-reporter=tap --test-name-pattern "writeCoverageSection replaces the links of the analysis by their text" ../../../build/coverage-section.test.js
TAP version 13
# Subtest: writeCoverageSection replaces the links of the analysis by their text
ok 1 - writeCoverageSection replaces the links of the analysis by their text
  ---
  duration_ms: 11.5017
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
# duration_ms 282.7366
[step 7] execTest writes the status of each test and of the requirements above it
$ node --test --test-reporter=tap --test-name-pattern "execTest writes the status of each test and of the requirements above it" ../../../build/test.test.js
TAP version 13
# Subtest: execTest writes the status of each test and of the requirements above it
ok 1 - execTest writes the status of each test and of the requirements above it
  ---
  duration_ms: 631.3497
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
# duration_ms 969.2997
```
