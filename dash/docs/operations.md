# Running it

## Purpose

How to start, feed, read and back up a running `asljs-dash` instance: the two
processes, the environment variables that move its files, and the complete HTTP
surface.

## The two processes

`dash` runs as two independent Node processes. Either can be restarted alone.

- The **server** (`server.js`) owns the store and serves the page.
- The **runner** (`runner.js`) owns the schedule: it reads `cronfile`, runs
  agents, and puts their stdout to the server over HTTP.

From the repository root:

```powershell
npm -w asljs-dash run start     # server, http://localhost:3000
npm -w asljs-dash run runner    # runner, in a second terminal
npm -w asljs-dash run once      # run every agent now, then exit
```

`once` is the quick way to fill a card you have just added, without waiting for
its schedule.

The server has no dependency on the runner. Values can arrive from anything that
can issue a `PUT`, and the runner is only the scheduled case of that.

## Environment

- `PORT` — server port. Default `3000`.
- `DASH_DB` — path to the SQLite file. Default `dash.sqlite` in the package
  folder.
- `DASH_SAMPLES` — path to `samples.json`. Default the package folder.
- `DASH_CRONFILE` — path to `cronfile`, read by the runner. Default the package
  folder.
- `DASH_URL` — base URL the runner puts to. Default `http://localhost:$PORT`.
- `DASH_TIMEOUT` — per-agent timeout in milliseconds. Default `60000`.

Agents are spawned with the package folder as their working directory, so a
`cronfile` command may name `agents/disk.c.ps1` relatively.

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
- `GET /api/keys` — every key the store holds.
- `GET /api/dashboards` — the parsed `dashboards.json`, re-read per request.

A key must match `[a-zA-Z0-9_.-]+`. Anything else is rejected with `400`, and
that is the only validation the server does: malformed JSON in a value is a
rendering problem, not a server problem.

Assets:

- `GET /` — the page.
- `GET /dash.js`, `GET /layout.js`, `GET /renderers/*.js` — the page's modules.

Nothing else is on the wire. The store, `agents/`, `cronfile`, `samples.json`
and `dashboards.json` are not served as static files.

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

- Values live in `dash.sqlite` and survive a restart. Keys whose policy says
  `memory` do not.
- Back up by copying `dash.sqlite`. The `-wal` and `-shm` sidecars are SQLite's
  own; copy them too if the server is running.
- The file is ignored by git, as is every `dash.sqlite-*` sidecar.
- Logs go to stdout. The runner logs each run's key, exit code, duration, and
  whether the value changed.

## Edge cases

- An agent exiting non-zero records nothing; the runner logs the exit code. This
  is the intended way for an agent to say "no reading this time".
- An agent writing to stderr but exiting zero still records its stdout; stderr
  is logged and never enters the value.
- An agent that outruns `DASH_TIMEOUT` is killed and treated as a failure.
- `samples.json` is reloaded when it changes on disk. A malformed entry is
  reported on stderr and the previous policy for that key stays in force.
- A malformed `dashboards.json` fails the `/api/dashboards` request with `500`
  and the message; the server keeps running.
- Retention is swept once a minute as well as on write, so a key nobody writes
  to still ages out.
