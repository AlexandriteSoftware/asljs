# R13 Loading configs

The server and the runner load every --config <path> (or -c), in order; without
one, the paths of DASH_CONFIG; failing that, the package's dash.config.json.
project is required and matches the key pattern, and label defaults to it.
Project names, keys and tab names are unique across every loaded config: a
duplicate is reported naming the config that claimed it first, which keeps it. A
malformed entry is reported and skipped and the rest of its file loads; a file
that does not parse is reported and skipped and the other configs load. The
server reloads the configs when one changes on disk.

## Implementation

- [T9 Loading configs][T9]

[T9]: <tests/T9 Loading configs.md>

## Coverage

R13 is fully covered by T9 and the tests its steps name. I checked each
statement below against the test code in `config.test.js` and `server.test.js`.

- **The server and the runner load every `--config` or `-c`, in order:** T9
  "command line" checks that parseArgs keeps `--config a.json -c b.json
  --config=c.json` in that order and reports a `-c` or `--config` given without
  a path. T9 "bad command line" checks that load reports that error too. T9
  "server as a program" starts `server.js --with-runner --config <file>` and
  checks that the configured database file exists before any put. T9 "runner as
  a program" starts the runner with its configs and checks that it puts the
  counter's value.
- **Without a `--config`, the paths in DASH_CONFIG are used; failing that, the
  package's `dash.config.json`:** T9 "fallbacks" checks both, and also that an
  empty entry in DASH_CONFIG is skipped.
- **project is required:** T9 "malformed files" loads `missing.json`, a config
  with only a label. It is reported and the other configs still load.
- **project matches the key pattern:** T9 "malformed files" loads
  `nameless.json` with project `'a b'`, and checks that it is reported with the
  key pattern.
- **label defaults to the project:** T9 "a project" loads a config with no label
  and gets `label: 'site'` back. The first-project test in `config.test.js` also
  checks this, but T9 does not link that test.
- **Project names, keys and tab names are unique across every loaded config, and
  the first config keeps a duplicate:** T9 "duplicates". The first file's
  command for `shared` is kept, tab `main` stays with project `one`, and
  `again.json` is rejected because it declares project `one` again.
- **A duplicate is reported naming the config that claimed it first:** T9
  "duplicates". The project message names the first file. The key and tab
  messages name the first project (`one`) instead. A project belongs to exactly
  one config, so this still identifies the config. If the wording should match
  the messages exactly, reword the statement to "naming the config, or the
  project, that claimed it first". This is optional.
- **A malformed entry is reported and skipped, and the rest of its file loads:**
  T9 "malformed entries" covers it with:
  - bad keys
  - null or half-filled counters
  - a bad startup flag
  - bad policies and bad cron expressions
  - a tab without a name

  `c.good` and tab `c` still load.
- **A file that does not parse is reported and skipped, and the other configs
  load:** T9 "malformed files" loads `broken.json` alongside `good.json`, and
  `good` still loads.
- **The server reloads the configs when one changes on disk:** T9 "reload" shows
  `config.watch` reloading the configs. The new step, T9 "reload in the server",
  names the combined server test, which ends by rewriting the config while
  `server.js` runs. It then checks that `/api/dashboards` lists the new tab
  `added` with no restart. Removing the server's watch wiring would now make a
  linked test fail. This closes the gap the earlier analysis reported.

R13's own Coverage and Status sections are out of date. They still report the
server reload as untested, so they should be regenerated. I did not modify any
file.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
