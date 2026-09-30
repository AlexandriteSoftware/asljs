# Concept

## Purpose

A personal, AI-assisted performance dashboard. Agents collect, the server
stores, the page renders.

This is a concept document: facts and decisions, not instructions. It exists so
an agent can add monitors and cards without re-deriving the design. It is
deliberately small.

---

## 1. Vision

- One wall-display page that answers "how are my things doing right now, and is
  it getting better or worse".
- Personal tool, single user, single machine, trusted network. No auth, no
  multi-tenancy, no cloud.
- Adding a monitor is a 10-minute job: write a script, add a cron line, add a
  card to a JSON file.
- Every new monitor is expected to be added _by Claude Code_, from a prompt. The
  design optimises for that: plain files, obvious names, no GUI, no build step.
- Hardcoding and plain JSON configs are correct choices here. Generality is not
  a goal.

## 2. Non-goals

- No user accounts, roles, or sharing.
- No web-based editor for dashboards or agents. CLI and text files only.
- No plugin registry, no npm package per card, no bundler, no framework.
- No alerting of any kind — no delivery, no pinning, no attention zone. A card
  that matters is a card you put on a tab.
- No horizontal scale, no clustering, no migration tooling beyond a single
  schema file.

## 3. Domain terms

Use these words in code, config, docs, and commit messages.

- **key** — a name a value is stored under. `[a-zA-Z0-9_.-]+`. Example:
  `disk.c`, `calendar.due`.
- **value** — the text an agent puts under a key. Usually JSON; may be a bare
  string or number.
- **sample** — one `(key, value, timestamp)` record. History is a list of
  samples.
- **agent** — an executable or script that produces a value for one key.
- **cronfile** — the single file listing which agents run when.
- **dashboard** — one screenful of cards. Reached by a tab in the top bar.
- **tab** — the navigation entry for a dashboard.
- **card** — one box on the grid. A renderer plus a key plus parameters.
- **renderer** — the code that turns a value into card content. Named, reusable,
  parameterised.
- **grid step** — 36px. All card geometry is in grid steps.

## 4. Architecture

Two layers, joined only by the HTTP API and the key namespace.

```
collecting layer                 presentation layer
----------------                 ------------------
agents/*.{ps1,js,exe}            index.html + renderers/*.js
      |  PUT /api/put/:key             ^  GET /api/get/:keys
      v                                |  GET /api/history/:key
   +-------------------------------------------+
   |            server.js (Express 5)          |
   |            dash.sqlite (samples)          |
   +-------------------------------------------+
                   ^
                   |  reads
            dashboards.json
```

- The server knows nothing about agents. An agent is just an HTTP client.
- The server knows nothing about card semantics. A value is opaque text.
- Renderers know nothing about where a value came from.
- Consequence: any of the three can change alone. This is the main property to
  preserve.

## 5. Storage

- SQLite file `dash.sqlite` in the package folder, moved by `DASH_DB`. One
  table.
- `samples(key TEXT, ts INTEGER, seen INTEGER, value TEXT)`, index on
  `(key, ts DESC)`.
- Current value of a key = its newest sample. There is no separate current-value
  table.
- **Values are sticky.** A put whose value is byte-identical to the key's newest
  sample creates no new record; it only bumps that sample's `seen`. A new record
  appears only when the value actually changes.
  - `ts` — when this value first appeared. `seen` — when it was last confirmed
    still current.
  - History is therefore a list of _changes_, not of polls. A steady value costs
    one row, however often its agent runs.
  - Consequence for renderers: consecutive samples are not evenly spaced.
    Anything plotting over time must carry each value forward to the next
    sample's `ts`, and the newest value forward to `seen`.
  - Consequence for freshness: staleness is `now - seen`, never `now - ts`.
- **Persistence is per key, and always bounded.** `samples.json` gives every key
  four fields:

      "ping.gw": "database, 30*24h, 50k, 20Mb"
                  store,    retention, count, quota

  - `store` — `memory` (process-local, lost on restart, never touches SQLite) or
    `database`.
  - `retention` — how long a sample survives, counted from `seen`. Suffixes `s`
    (default), `m`, `h`.
  - `count` — how many samples the key may hold. Suffixes `k`, `M`, `G`
    (decimal).
  - `quota` — total size of the key's stored data. Suffixes `Kb`, `Mb`, `Gb`
    (1024-based).
  - Suffixes are case-insensitive, and any field may be a product: `90*24h`,
    `2*512Kb`.
  - There is no unlimited option. Every field must be greater than zero; `0` is
    a config error.
  - Size counts the values only, as UTF-8 bytes. Keys, timestamps and index
    overhead are not the user's budget to spend.
  - Whichever limit bites first wins, and the oldest sample always goes first.
    The one exception: the quota never evicts the newest sample, because that
    sample is the key's current value.
  - Keys not listed get the `default` entry, which ships as
    `database, 90*24h, 100k, 100Mb`.
  - Limits are applied on write, and swept once a minute besides — expiry is a
    clock event, so a key nobody writes to still ages out.
  - `samples.json` is read at startup and reloaded when it changes; editing it
    needs no restart. A malformed entry is reported on stderr and the previous
    config for that key stays in force.
- The store is the record of performance over time. Charts read it directly;
  agents never keep state.

## 6. HTTP API

- `PUT /api/put/:key` — body is the value, any content-type, read as text.
  Echoes the body. Appends a sample, or bumps `seen` on the newest one if the
  value is unchanged (see §5).
  - `POST` on the same path is an alias, so one-line curl and
    `Invoke-RestMethod` recipes keep working.
  - `/api/set/:key` stays as a deprecated alias of the same handler.
- `GET /api/get/:key` — newest value as `text/plain`. Empty string if the key
  was never written.
- `GET /api/get/:k1,:k2,...` — JSON object of newest values, `null` for unknown
  keys.
- `GET /api/history/:key?limit=N&since=<ms>` — JSON array of
  `{ts, seen, value}`, newest first. For charts.
- `GET /api/meta/:keys` — the same keys with their `ts` and `seen`, for
  freshness checks.
- `GET /api/keys` — every key the store has ever seen.
- `GET /api/dashboards` — the parsed `dashboards.json`, so the page does not
  embed its own config.
- `GET /` — the single page. Tab selection is client-side, in the fragment
  (`/#day`).
- Only `index.html`, `dash.js`, `layout.js` and `renderers/` are served. The
  store, the agents, `cronfile` and `dashboards.json` are never static files on
  the wire.

Rules:

- The API is textual and curl-friendly. Anything doable from PowerShell in one
  line stays that way.
- No request validation beyond the key pattern. Bad JSON is a rendering problem,
  not a server problem.

## 7. Collecting layer

- All agents live in `agents/`. One file per monitor, named after its key:
  `agents/disk.c.ps1`.
- An agent may be any executable, or a script run through one (`powershell`,
  `node`, `python`, `cmd`).
- Contract: write the value to stdout, exit 0. A non-zero exit means "no sample"
  and is logged.
- Writing to stdout is preferred over putting directly, so an agent can be run
  and inspected alone.
- Agents are stateless and idempotent. Running one twice is harmless.
- `cronfile` — one line per agent: `<cron expression> <key> <command...>`.
  Comments start with `#`.
  - Example: `*/5 * * * *  disk.c  powershell -File agents/disk.c.ps1`
- `runner.js` reads `cronfile`, runs commands on schedule, and puts stdout to
  the named key.
  - Separate process from the web server, restartable independently.
  - Timeout per run; stderr goes to the runner's log, never into the value.
- Adding a monitor never touches `server.js`.

## 8. Value conventions

A value is whatever the card's renderer expects. Conventions, not enforcement:

- Single number or string: put it bare — `41.3`, `online`.
- Anything structured: put JSON, keyed by the fields the renderer names.
- Lists: a JSON array of objects, each with at least a `label`.
- Status: a `status` field of `ok` | `warn` | `error`, optionally `message`. The
  `status` renderer colours the card by it; nothing else reacts to it.
- Timestamps inside a value are ISO strings; the sample's `ts` is authoritative
  for _when_.
- Absolute dates only, never "in 5 days" — agent and page render at different
  times.
- Keep values free of incidental noise. A timestamp or run counter the renderer
  never shows defeats stickiness and turns every poll into a new row.

## 9. Presentation layer

### Page structure

- **Top bar** — one grid step tall. `DASH` wordmark (plain text, not a link)
  flush with column 0, then the tabs immediately after it. Nothing else lives in
  the bar.
- **Dashboard** — the grid: absolutely positioned cards on 36px steps.
- Every tab is an ordinary tab; the first one is simply the one shown by
  default.

### Grid

- `--grid-step: 36px`. Card geometry comes from four inline CSS custom
  properties — `--left`, `--top`, `--width`, `--height` — each in steps.
- Background grid lines are drawn at the same step, so cards visibly snap to it.

### Layout

Geometry is smart: only what you care about is written down.

- `width` and `height` default to **6** steps. A card with no geometry at all is
  legal.
- `top` and `left` are optional. Column count is computed from the viewport:
  `cols = floor(innerWidth / gridStep)`, so a card never lands off-screen to the
  right.
- A **virtual screen** — a 2-D array of cells, `@` where occupied — drives
  placement. Rows are added as needed; the page scrolls vertically if cards
  outgrow the viewport.
- Two passes, in this order:
  1. **Anchored cards** — both `top` and `left` given. Placed exactly as
     written, and marked on the virtual screen. They always win; an anchored
     card is never moved.
  2. **Flowed cards** — in the order they appear in the tab's `cards` list. For
     each, scan the virtual screen horizontally, line by line (`y` outward, `x`
     from 0 to `cols - width`), testing the `width × height` rectangle at each
     position; place at the first one containing no `@`.
- Partially anchored cards flow with that axis pinned: `left` only scans
  downward in that column, `top` only scans rightward along that row and then
  continues below it.
- A card wider than `cols` is clamped to `cols`. The algorithm is naive and
  re-runs on resize — at this card count that is free, and it keeps the rule
  easy to predict.
- Reordering cards in `dashboards.json` is therefore the normal way to rearrange
  a tab.

### Design

- Light and dark, chosen by `prefers-color-scheme`, both low contrast. Paper and
  ink, not black on white.
- **Pico CSS 2** (classless, CDN, no build) supplies reset, typography, and both
  colour schemes. Dash adds only the top bar, the grid, and the cards on top of
  it.
- Tokens are CSS custom properties on `:root`, redefined in a dark media block.
  Never a hardcoded colour in a renderer.
- Token set: `--paper`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`,
  `--signal`, `--grid-step`.
- Values are monospace; labels are small, uppercase, muted. One accent colour,
  one signal colour.
- Restrained: thin borders, small radius, at most one flat shadow. No gradients,
  no glow, no animation beyond a value fading when it changes.

### Refresh

- The page polls `GET /api/get/<keys on the active tab>` every 5s and re-renders
  cards whose value changed.
- Chart cards additionally poll their own `/api/history/...` on a longer
  interval.
- A screen wake lock is held while the page is visible, so it survives on a wall
  display.

## 10. Cards and renderers

- A card is a config entry; a renderer is a function. Cards are data, renderers
  are code.
- Card config fields:
  - `key` — the key to read. Required except for renderers that read nothing.
  - `label` — the heading shown on the card.
  - `render` — renderer name.
  - `width`, `height` — grid steps. Optional, default 6.
  - `left`, `top` — grid steps. Optional; omit to let the card flow (see
    Layout).
  - `params` — renderer-specific object. Everything variable lives here, nothing
    at the top level.
- A renderer is one file, `renderers/<name>.js`, default-exporting
  `(el, value, params, ctx) => void`.
  - It receives the parsed value when the value is JSON, the raw string
    otherwise.
  - It writes into `el`, the card body, and must escape anything it did not
    create.
  - `ctx` carries `key`, `card`, and `history({ limit, since })` — the only way
    to reach the store.
  - It is synchronous and free of side effects outside `el`. Chart renderers may
    await `ctx.history`.
- Renderers are resolved by name from `dashboards.json`. Adding one is adding a
  file.

### Built-in renderers

- `value` — one big number or word. `params`: `unit`, `precision`.
- `text` — preformatted text, scrollable. For command output. `params`: `wrap`.
- `chart` — line or bar over history. `params`: `field`, `limit`, `kind`, `min`,
  `max`.
- `list` — rows from a JSON array. `params`: `fields`, `limit`, `empty`.
- `status` — status word plus message, coloured by `status`. `params`: `labels`.
- `table` — a JSON array as columns. `params`: `columns`.

### Custom cards

- A card needing a purpose-built view gets its own renderer named for the task
  (`renderers/calendar-due.js`), never a new card type in the server.
- Data _shaping_ belongs in the agent, not the renderer. "Calendar items due
  within 5 days" is an agent that queries the calendar and puts the filtered
  list; the renderer just draws rows.
- Rule of thumb: if the change is about _what_ is shown, edit the agent. About
  _how_, edit the renderer.

## 11. Dashboard configuration

- Single file `dashboards.json`, hand- and CLI-editable, read by the server and
  served to the page.
- Shape: a list of tabs, each with a name and a list of cards.

```json
{
  "tabs": [
    {
      "tab": "system",
      "label": "System",
      "cards": [
        { "key": "ping.gw", "label": "Gateway", "render": "status", "pin": true,
          "left": 0, "top": 0, "width": 8, "height": 4 },
        { "key": "disk.c", "label": "Disk C:", "render": "value",
          "params": { "unit": "%" } },
        { "key": "disk.c", "label": "Disk C: trend", "render": "chart",
          "width": 16, "params": { "limit": 288, "kind": "line" } }
      ]
    }
  ]
}
```

- The first tab is the default. Tab order in the file is tab order in the bar.
- Several cards may read the same key. Keys and cards are independent.
- Config errors show on the card, never thrown. A missing renderer draws a
  visible placeholder.
- Config is re-read per request, so editing the file needs no server restart.

## 12. Typical workflow

Adding a monitor, end to end:

1. Write `agents/<key>.ps1` (or any executable) that prints the value to stdout.
2. Run it by hand once; confirm the output is the shape the renderer wants.
3. Add a line to `cronfile`: schedule, key, command.
4. Add a card to the right tab in `dashboards.json` — key, label, renderer,
   geometry, params.
5. Restart the cron runner. Reload the page.

Variations:

- New view of existing data: step 4 only.
- New shape of data: steps 1–4, plus a renderer if no built-in fits.
- Retire a monitor: remove the cron line and the card. Samples stay until its
  `samples.json` policy trims them.

## 13. File map

```
dash/
  server.js           Express app: put, get, history, dashboards, page
  runner.js           reads cronfile, runs agents, puts their stdout
  store.js            the sticky put, get and history
  samples.js          per-key persistence policy, parsed from samples.json
  schema.sql          the one table and its index
  dash.sqlite         the store (gitignored)
  dashboards.json     tabs and cards
  samples.json        per-key store, retention, count and quota
  cronfile            schedule -> key -> command
  index.html          shell: top bar, grid, Pico CSS
  dash.js             page loop: fetch config, place cards, poll values
  layout.js           virtual-screen card placement
  renderers/          one file per renderer
  agents/             one file per monitor
  package.json        the asljs-dash workspace package
  eslint.config.js    repo lint rules, split by Node and browser runtime
  AGENTS.md           AI-facing constraints for this package
  README.md           landing page
  docs/operations.md  running it, the HTTP API, backup
  docs/monitors.md    adding a monitor
  docs/concept.md     this document
```

## 14. Operational facts

- Two processes: `node server.js` and `node runner.js`. Either restarts alone.
  From the repository root: `npm -w asljs-dash run start` and `run runner`.
- ES modules throughout, server and page alike, as the rest of the repository.
- Port from `PORT`, default 3000. Paths from `DASH_DB`, `DASH_SAMPLES`,
  `DASH_CRONFILE`; see docs/operations.md.
- Restarting no longer loses values — that is the point of SQLite.
- Logs go to stdout. The runner logs each run's key, exit code, and duration.
- Backup is copying `dash.sqlite`.

## 15. Decisions worth not revisiting

- **Append-on-change samples, newest-wins reads.** Makes history free, keeps the
  store small, and makes "when did this last change" answerable without
  scanning.
- **Text API.** Any shell can feed the dashboard in one line; no client library
  is ever needed.
- **Agents shape, renderers draw.** Keeps renderers small and reusable, and
  keeps task-specific logic somewhere it can be run and tested on its own.
- **JSON config, no editor.** The intended editor is an AI coding agent.
- **No build step.** `index.html` and `renderers/*.js` are served as written, as
  ES modules.
