# R12 Project configuration

A project is one JSON config naming the project, its database, its default
sample policy, its counters and its tabs. The server and the runner read the
same configs.

## Implementation

- [R13 Loading configs][R13]
- [R14 Counters][R14]
- [T19 Project configuration][T19]

[R13]: <R13 Loading configs.md>
[R14]: <R14 Counters.md>
[T19]: <tests/T19 Project configuration.md>

## Coverage

R12 is fully covered. T19 is new since R12's own Coverage section was written,
and it closes the three gaps that section reports (database, default sample
policy, tabs). That section and its INCOMPLETE status are now out of date and
should be regenerated.

Statement by statement:

- **"A project is one JSON config naming the project":** R13 states that
  `project` is required, matches the key pattern, and is the default for
  `label`, and that a file that does not parse is reported and skipped. T19 "one
  config" loads one `dash.config.json` with `project: 'site'` and checks that
  `config.projects()` returns `{ project: 'site', label: 'site', … }`.
- **"…its database":** T19 "one config" sets `db: 'data/site.sqlite'` and
  asserts that it resolves against the config's own folder, to
  `<dir>/site/data/site.sqlite`.
- **"…its default sample policy":** T19 "one config" declares `samples: 'memory,
  1h, 10, 1Kb'` at the project level. It asserts that `site.manual`, which
  declares no policy, gets that policy, while `site.ping` keeps its own
  `database, 2h, 20, 2Kb`. T19 "project default policy" adds that a key no
  counter declares falls to the first project and gets that project's default;
  in that test it is the built-in default, because project `a` declares none.
  R14 states the counter's own optional policy.
- **"…its counters":** R14 states the counter fields and the cron syntax, and
  T10 checks them. T19 "one config" also checks that `site.ping` keeps its key,
  schedule, trimmed command and startup flag, and that its working directory is
  the config folder.
- **"…its tabs":** T19 "one config" asserts that `config.tabs()` returns the
  declared tab with its label and cards, attributed to project `site`. R13 adds
  that tab names are unique across configs.
- **"The server and the runner read the same configs":** R13 states that both
  programs load every `--config`/`-c`, then DASH_CONFIG, then the package's
  `dash.config.json`, and T9 checks that. T19 "the server reads them" starts
  `server.js --config <file>` and checks that the configured database is opened
  at startup and the configured counter runs. T19 "the runner reads them" starts
  `runner.js --once --config <file>` and checks that the configured counter's
  value is put. Both programs accept the same config file and act on what it
  declares.

Two minor notes, neither of which leaves a statement uncovered:

- T19 "the server reads them" names its test by a prefix of the actual test name
  ("server.js as a program opens every configured database at startup, listens
  on PORT, …"). T19's status reports all 4 steps passing, so the prefix
  resolves. Spelling out the full name would make the link sturdier.
- The same server test now rewrites its config while `server.js` runs and checks
  that `/api/dashboards` shows the new tab. That closes the reload gap R13's own
  Coverage section still reports, so R13's Coverage and Status should be
  regenerated too.

Verdict: R12 is fully covered by R13, R14 and T19.

## Status

- Result: PASS
- Coverage: COMPLETE
