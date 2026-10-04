# Running it

## Purpose

How to start, feed, read and back up a running `asljs-dash` instance: the two
processes, the configs they load, the environment variables that move their
files, and the complete HTTP surface.

## The two processes

`dash` runs as two independent Node processes. Either can be restarted alone.

- The **server** (`server.js`) owns the stores and serves the page.
- The **runner** (`runner.js`) owns the schedule: it runs each counter's command
  and puts its stdout to the server over HTTP.

Both read the same project configs, so give both the same `--config` list.

From the repository root:

```powershell
npm -w asljs-dash run start     # server, http://localhost:3000
npm -w asljs-dash run runner    # runner, in a second terminal
npm -w asljs-dash run once      # run every counter now, then exit
```

Those scripts pass this repository's two configs — `dash/dash.config.json` for
the machine and `dash.config.json` at the repository root for the ASLJS project.
Run either process by hand to load a different set:

```powershell
node server.js --config dash.config.json --config ../../work/dash.config.json
node runner.js --config dash.config.json --config ../../work/dash.config.json
```

`once` is the quick way to fill a card you have just added, without waiting for
its schedule.

For the simple setup, `--with-runner` starts the runner inside the server
process, so one process does both:

```powershell
npm -w asljs-dash run start:with-runner
node server.js --with-runner --config dash.config.json
```

The embedded runner is the same code: it puts each value through
`PUT /api/put/:key` on the server's own port, ignoring `DASH_URL`, and its log
lines go to the server's stdout. Restarting the server restarts the runner too.

The server has no dependency on the runner. Values can arrive from anything that
can issue a `PUT`, and the runner is only the scheduled case of that.

## Which configs are loaded

Both processes resolve them the same way, first match winning:

- every `--config <path>` (or `-c <path>`) on the command line, in order;
- `DASH_CONFIG`, a list of paths separated by `;` on Windows and `:` elsewhere;
- `dash.config.json` in the package folder.

The first config loaded is the default project: it owns the first tab the page
shows, and any key no config declares. A config that does not parse is reported
on stderr and skipped, and the others still load.

## Environment

- `PORT` — server port. Default `3000`.
- `DASH_CONFIG` — path list of project configs, used when no `--config` is
  given.
- `DASH_DB` — the database a project without a `db` of its own uses. Default
  `dash.sqlite` beside the config.
- `DASH_URL` — base URL the runner puts to. Default `http://localhost:$PORT`.
  Not used by `--with-runner`, which always puts to its own server.
- `DASH_TIMEOUT` — per-agent timeout in milliseconds. Default `60000`.

A counter's command is spawned with its own config file's directory as the
working directory, so `agents/disk.c.ps1` in `dash/dash.config.json` is
`dash/agents/disk.c.ps1`.

## HTTP API

Writing:

- `PUT /api/put/:key` — the body is the value, read as text whatever the
  content-type. The body is echoed back. `POST` on the same path is an alias.
  `/api/set/:key` is a deprecated alias of both.
  - The response carries `X-Dash-Changed: true|false`, which is how the runner
    reports whether a sample was appended or an existing one was confirmed.

Reading:

- `GET /api/get/:key` — the newest value as `text/plain`, or an empty string for
  a key that was never written.
- `GET /api/get/:k1,:k2,...` — a JSON object of newest values, `null` for
  unknown keys.
- `GET /api/history/:key?limit=N&since=<ms>` — a JSON array of
  `{ts, seen, value}`, newest first. `limit` defaults to 500 and is capped at
  5000.
- `GET /api/meta/:keys` — the same keys with their `ts` and `seen`, for
  freshness and change detection.
- `GET /api/next/:keys` — per key, `{ state, ms }`: `wait` with the milliseconds
  until its counter next runs, or `due` / `stale` with the milliseconds it is
  overdue by. `null` for a key nothing is scheduled to write. The card
  countdowns poll this every five seconds.
- `GET /api/keys` — every key the stores hold.
- `GET /api/dashboards` — `{ projects, tabs, errors }` merged from every loaded
  config. Database paths and counter commands are not included.

A key must match `[a-zA-Z0-9_.-]+`. Anything else is rejected with `400`, and
that is the only validation the server does: malformed JSON in a value is a
rendering problem, not a server problem.

Assets:

- `GET /` — the page.
- `GET /dash.js`, `GET /layout.js`, `GET /renderers/*.js` — the page's modules.

Nothing else is on the wire. The stores, `agents/` and the configs are not
served as static files.

## Feeding it from the shell

Store a value:

```powershell
curl.exe -X PUT http://localhost:3000/api/put/status `
    -H "Content-Type: text/plain" `
    --data-binary "online"
```

Pipe a command's output straight in:

```powershell
$output = Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Out-String

Invoke-RestMethod -Uri "http://localhost:3000/api/put/message" `
    -Method Put -ContentType "text/plain" -Body $output
```

The body is stored and echoed exactly as sent. Values are **sticky**: putting
the same value again records no new sample, it only marks the existing one as
still current.

## Backup and restart

- Values live in their project's `dash.sqlite` and survive a restart. Keys whose
  policy says `memory` do not.
- Back up by copying each project's database; `node server.js --config ...`
  prints the path of every one it opened. The `-wal` and `-shm` sidecars are
  SQLite's own; copy them too if the server is running.
- Those files are ignored by git, as is every `dash.sqlite-*` sidecar.
- Logs go to stdout. The runner logs each run's key, exit code, duration, and
  whether the value changed.

## Edge cases

- An agent exiting non-zero records nothing; the runner logs the exit code. This
  is the intended way for an agent to say "no reading this time".
- An agent writing to stderr but exiting zero still records its stdout; stderr
  is logged and never enters the value.
- An agent that outruns `DASH_TIMEOUT` is killed and treated as a failure.
- Configs are reloaded when they change on disk, so the server picks up a new
  card or policy without a restart. The runner reads them once, so restart it
  after changing a schedule or a command — with `--with-runner`, that means
  restarting the server.
- A malformed entry is reported on stderr and skipped; the rest of the file
  still loads, and `/api/dashboards` reports the messages in `errors`.
- A key declared as a counter in two configs is a config error: the first config
  keeps it, the second is ignored. The same holds for project and tab names.
- Moving a counter to another project points it at that project's database; the
  samples it already has stay in the old one.
- A card reads `stale` when the runner is not running, when its agent keeps
  failing, or when the server has just started and its counter has not reported
  yet. It clears on the first successful put.
- Retention is swept once a minute as well as on write, so a key nobody writes
  to still ages out.
