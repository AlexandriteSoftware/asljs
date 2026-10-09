# R11 Dashboards and assets

GET /api/dashboards answers the projects, the tabs and the config errors,
without database paths or counter commands. Only the page is served - /,
/dash.js, /layout.js and /renderers/ - never the stores, the agents, the configs
or the tests.

## Implementation

- [T8 Dashboards and assets][T8]

[T8]: <tests/T8 Dashboards and assets.md>

## Coverage

R11 is fully covered by its three T8 steps. The Coverage section currently in
R11 is out of date: both gaps it lists are now covered, by T8's "config errors"
step and by the wider assets step.

**GET /api/dashboards answers the projects and the tabs.** T8's "dashboards"
step loads one project with one tab. It checks that the response is exactly
`projects: [{ project: 'web', label: 'Web' }]` and the tab `web`, with its
label, project and cards.

**…and the config errors.** T8's "config errors" step loads a config with a
counter that has a schedule but no command. It checks that `errors` in
/api/dashboards has exactly one entry, `counter web.half needs both schedule and
command`. The "dashboards" step adds the case of a valid config, where `errors`
is an empty array. Together they show that real errors are reported, not a fixed
empty list.

**Without database paths or counter commands.** The "dashboards" step checks
that the raw response text contains neither the database file name `web.sqlite`
nor the counter command `secret-command`.

**Only the page is served: /, /dash.js, /layout.js and /renderers/.** T8's
"assets" step checks that `/`, `/dash.js`, `/layout.js`, `/renderers/value.js`
and `/renderers/value` each return 200. It also checks that `/`, `/dash.js` and
`/renderers/value.js` return exactly the bytes of `index.html`, `dash.js` and
`renderers/value.js`.

**Never the stores.** The "assets" step checks that the database file names
`/web.sqlite` and `/dash.sqlite`, and the database location
`/.dash/dash.sqlite`, return 404. It checks the same for the store source files
`/store.js` and `/schema.sql`. The `-wal` and `-shm` sidecars are not requested
by name. They sit beside the database files that were shown to be unreachable,
so this is a minor optional addition, not a gap.

**Never the agents.** The "assets" step checks that `/agents/git.ps1`
returns 404.

**Never the configs.** The "assets" step checks that `/dash.config.json`
returns 404.

**Never the tests.** The "assets" step checks that `/renderers/value.test.js`
and `/renderers/value.test` return 404. It also checks that
`/renderers/../server.js`, a path that tries to escape `/renderers/`,
returns 404.

Maintainers should rewrite the Coverage section of R11 to match the current T8
steps. At the moment it still reports the config errors and the database files
as not covered.

Verdict: every statement of R11 is covered by T8.

## Status

- Result: PASS
- Coverage: COMPLETE
