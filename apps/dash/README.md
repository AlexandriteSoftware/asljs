# dash

> Part of [Alexandrite Software Library][#1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

A personal performance dashboard for one machine and the projects on it.
Scheduled agents collect values, a small Express server stores them in SQLite,
and a static page renders them as cards. Each project is one config file, and
dash shows the tabs of every project it is given.

```powershell
npm -w asljs-dash run start     # the web server, http://localhost:3000
npm -w asljs-dash run runner    # the cron runner, in a second terminal
```

Or both in one process: `npm -w asljs-dash run start:with-runner`.

A value arrives as plain text under a key:

```powershell
curl.exe -X PUT http://localhost:3000/api/put/status `
    -H "Content-Type: text/plain" `
    --data-binary "online"
```

## Scope

One wall-display page answering "how are my things doing right now, and is it
getting better or worse", for a single user on a trusted network.

- **One file per project.** A config names the project's database, its counters
  and its tabs. `--config` is repeatable, so several projects share one page.
- **Anything that prints.** An agent is any script or executable that writes a
  value to stdout and exits zero. PowerShell, Node, Python, a bare `.exe`.
- **Text over the wire.** Every endpoint is curl-friendly, so a shell one-liner
  is a complete client.
- **Sticky samples.** An unchanged value records no new sample, so history is a
  list of changes and a steady value costs one row however often it is polled.
- **Bounded by key.** Every key carries a retention, a count and a byte quota,
  so the store cannot grow without a limit.
- **No build step.** The page and the renderers are served as written, as ES
  modules.

Out of scope: accounts and sharing, alert delivery, a web editor for dashboards
or agents, and anything beyond a single machine.

## Installation

Private to this repository, not published to npm. From the repository root:

```powershell
npm i
```

Requires Node with `node:sqlite` (Node 22 or later). Each project's store is
created on first start from `schema.sql`.

## Usage

A project is one JSON file: where its samples go, what feeds them, and what the
page shows.

```json
{
  "project": "asljs",
  "db": "dash.sqlite",

  "counters": {
    "asljs.git": {
      "schedule": "*/2 * * * *",
      "command": "pwsh -NoProfile -File dash/agents/git.ps1"
    }
  },

  "tabs": [
    {
      "tab": "asljs",
      "label": "ASLJS git",
      "cards": [
        { "key": "asljs.git", "label": "Working folder", "render": "git",
          "width": 7, "height": 5 }
      ]
    }
  ]
}
```

A counter's command is anything that prints a value and exits zero:

```powershell
# agents/disk.c.ps1
$drive = Get-PSDrive -Name C
[pscustomobject]@{ freePercent = [math]::Round($drive.Free / ($drive.Used + $drive.Free) * 100, 1) } |
    ConvertTo-Json -Compress
```

Point both processes at as many configs as you like:

```powershell
node src/server.js --config dash.config.json --config ../dash.config.json
node src/runner.js --config dash.config.json --config ../dash.config.json
```

Adding a card is an edit and a page reload. Adding a monitor is an agent, a
counter and a card, then a runner restart; `npm -w asljs-dash run once` runs
every counter immediately, which is the quick way to fill a new card.

Read values back the same way they went in:

```powershell
curl.exe http://localhost:3000/api/get/status              # plain text
curl.exe http://localhost:3000/api/get/status,disk.c       # JSON object
curl.exe "http://localhost:3000/api/history/disk.c?limit=50"
```

## Further reading

- [Running it][OPS] — the two processes, environment variables,
  the HTTP API, and backup.
- [Adding a monitor][MON] — agents, counters, cards, renderers, how
  long samples are kept, and adding a project.
- [Concept][CON] — the design: layers, storage model, value
  conventions, and the decisions worth not revisiting.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- If you need a browser app with local-first storage, see `asljs-app-builder`.

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[CON]: docs/concept.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: ../../LICENSE.md
[MON]: docs/monitors.md
[OPS]: docs/operations.md
