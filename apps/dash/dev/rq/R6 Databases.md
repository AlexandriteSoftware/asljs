# R6 Databases

Each project has one SQLite database, its config's db resolved against the
config's folder, by default DASH_DB and failing that dash.sqlite beside the
config, and a key's samples are kept in the database of its project. Two
projects naming the same file share it. The server opens every configured
database when it starts.

## Implementation

- [T4 Databases][T4]

[T4]: <tests/T4 Databases.md>

## Coverage

The requirement is fully covered. T4 now has steps that test the two things the
earlier coverage note in R6 said were missing: that a key's samples land in its
own project's database, and that the databases are opened at startup.

R6 makes six statements. Here is the T4 step that covers each one.

- **Each project has one SQLite database.** Covered by T4 "db path" and T4
  "database of the project". "db path" checks that a loaded project has exactly
  one resolved `db`. "database of the project" loads two projects with different
  files and opens each file directly to check which keys it holds.
- **The config's db is resolved against the config's folder.** Covered by T4 "db
  path". The config test loads `site/dash.config.json` with `db:
  'data/site.sqlite'` and checks that the path comes out as
  `<tmp>/site/data/site.sqlite`.
- **By default the db is DASH_DB, and failing that dash.sqlite beside the
  config.** Covered by T4 "db default". Without the environment variable it
  checks for `dash.sqlite` beside the config. With `DASH_DB` set it checks for
  the `DASH_DB` value, resolved against the config folder.
- **A key's samples are kept in the database of its project.** Covered by T4
  "database of the project". It puts a key declared by project `two` and a key
  that no project declares. Then it reads both SQLite files directly: `own.key`
  is only in `two.sqlite`, and the undeclared key is in the first project's
  `one.sqlite`.
- **Two projects naming the same file share it.** Covered by T4 "shared file".
  Two configs name `shared.sqlite`, and `openAll` returns one connection. A key
  of the second project is then put and read back through it.
- **The server opens every configured database when it starts.** Covered by T4
  "server as a program". It starts `server.js` as a separate process with a
  config. After the server prints its listening line, and before any put, it
  checks that the configured database file exists.

There are two small points, but neither leaves a gap:

- The startup test uses one configured database. That checks the startup call to
  `openAll`, and "shared file" checks that `openAll` covers every configured
  project. Adding a second project to the startup test would make "every"
  explicit at the program level, but it isn't required.
- The step's test name, "server.js as a program opens every configured database
  at startup", is only the first part of the real test title, which goes on to
  cover listening on PORT and the embedded runner. Your recorded run (E2) passed
  all seven steps, so the shortened name still finds the test.

The steps "keys of every database" and "close" go beyond what R6 states. They
don't hurt the coverage.

The "Coverage" section in R6 is out of date: it still reports startup as not
covered. That doesn't affect this verdict, and I haven't changed any file.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
