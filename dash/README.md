# dash

> Part of [Alexandrite Software Library][#1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

A personal performance dashboard for one machine. Scheduled agents collect
values, a small Express server stores them in SQLite, and a static page renders
them as cards.

```powershell
npm -w asljs-dash run start     # the web server, http://localhost:3000
npm -w asljs-dash run runner    # the cron runner, in a second terminal
```

A value arrives as plain text under a key:

```powershell
curl.exe -X PUT http://localhost:3000/api/put/status `
    -H "Content-Type: text/plain" `
    --data-binary "online"
```

## Scope

One wall-display page answering "how are my things doing right now, and is it
getting better or worse", for a single user on a trusted network.

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

Requires Node with `node:sqlite` (Node 22 or later). The store is created on
first start from `schema.sql`.

## Usage

Adding a monitor is three files and a reload:

1. An agent in `agents/`, named after its key, printing the value to stdout:

   ```powershell
   # agents/disk.c.ps1
   $drive = Get-PSDrive -Name C
   [pscustomobject]@{ freePercent = [math]::Round($drive.Free / ($drive.Used + $drive.Free) * 100, 1) } |
       ConvertTo-Json -Compress
   ```

2. A line in `cronfile` giving the schedule, the key and the command:

   ```
   */5 * * * *   disk.c   pwsh -NoProfile -File agents/disk.c.ps1
   ```

3. A card in the right tab of `dashboards.json`:

   ```json
   { "key": "disk.c", "label": "Disk C: free", "render": "value",
     "params": { "field": "freePercent", "unit": "%" } }
   ```

Then restart the runner and reload the page. `npm -w asljs-dash run once` runs
every agent immediately, which is the quick way to fill a new card.

Read values back the same way they went in:

```powershell
curl.exe http://localhost:3000/api/get/status              # plain text
curl.exe http://localhost:3000/api/get/status,disk.c       # JSON object
curl.exe "http://localhost:3000/api/history/disk.c?limit=50"
```

## Further reading

- [Running it](docs/operations.md) — the two processes, environment variables,
  the HTTP API, and backup.
- [Adding a monitor](docs/monitors.md) — agents, schedules, cards, renderers,
  and how long samples are kept.
- [Concept](docs/concept.md) — the design: layers, storage model, value
  conventions, and the decisions worth not revisiting.

Questions and bugs:
[asljs/issues](https://github.com/AlexandriteSoftware/asljs/issues).

## Related packages

- If you need a browser app with local-first storage, see `asljs-app-builder`.

## License

MIT License. See [LICENSE](../LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
