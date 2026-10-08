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
- Several projects at once. Each project owns one config file, and dash shows
  every loaded project's tabs in one bar.
- Adding a monitor is a 10-minute job: write a script, add a counter to a
  project config, add a card to the same file.
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
- **counter** — a key together with what feeds it: a schedule, a command, and
  how long its samples are kept. Declared in a project config.
- **project** — one config file: a database, a set of counters, and a set of
  tabs. Loaded with `--config`, and several may be loaded at once.
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
   |     one dash.sqlite per project loaded    |
   +-------------------------------------------+
                   ^
                   |  reads
            dash.config.json  (one per project, --config)
```

- The server knows nothing about agents. An agent is just an HTTP client.
- The server knows nothing about card semantics. A value is opaque text.
- Renderers know nothing about where a value came from.
- Consequence: any of the three can change alone. This is the main property to
  preserve.

## 5. Storage

- One SQLite file per project, named by its config's `db` and resolved against
  the config's own directory. One table.
- A key belongs to exactly one project — the one whose config declares it as a
  counter — and its samples live in that project's database. Keys no config
  declares belong to the first project loaded.
- Key names are therefore one global namespace across every loaded config: a key
  declared twice is a config error, and the second declaration is ignored.
- Two projects may name the same file; the store is per file, so they then share
  one connection. Moving a counter to another project leaves its old samples
  behind in the previous project's database.
- `samples(key TEXT, ts INTEGER, seen INTEGER, value TEXT)`, index on `(key, ts
  DESC)`.
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
- **Persistence is per key, and always bounded.** A counter's `samples` line
  gives its key four fields:

      "ping.gw": { "samples": "database, 30*24h, 50k, 20Mb" }
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
  - A counter without a `samples` line gets its project's top-level `samples`
    policy, which itself defaults to `database, 90*24h, 100k, 100Mb`.
  - Limits are applied on write, and swept once a minute besides — expiry is a
    clock event, so a key nobody writes to still ages out.
  - Configs are read at startup and reloaded when one changes on disk; editing a
    policy needs no restart. A malformed entry is reported on stderr, is
    skipped, and the rest of the file still loads.
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
- `GET /api/history/:key?limit=N&since=<ms>` — JSON array of `{ts, seen,
  value}`, newest first. For charts.
- `GET /api/meta/:keys` — the same keys with their `ts` and `seen`, for
  freshness checks.
- `GET /api/next/:keys` — per key, `{ state, ms }` against its schedule: `wait`
  with the milliseconds until its counter next runs, or `due` / `stale` with the
  milliseconds it is overdue by. `null` for a key nothing is scheduled to write.
  This is what the card countdowns read.
- `GET /api/keys` — every key the store has ever seen.
- `GET /api/dashboards` — `{ projects, tabs, errors }` merged from every loaded
  config, so the page does not embed its own. Database paths and counter
  commands stay on the server.
- `GET /` — the single page. Tab selection is client-side, in the fragment
  (`/#day`).
- Only `index.html`, `dash.js`, `layout.js` and `renderers/` are served. The
  stores, the agents and the configs are never static files on the wire.

Rules:

- The API is textual and curl-friendly. Anything doable from PowerShell in one
  line stays that way.
- No request validation beyond the key pattern. Bad JSON is a rendering problem,
  not a server problem.

## 7. Collecting layer

- The agents dash ships live in `agents/`, one file per monitor, named after its
  key: `agents/disk.c.ps1`. A project may keep its own agents anywhere; its
  counter's command is what says where.
- An agent may be any executable, or a script run through one (`powershell`,
  `node`, `python`, `cmd`).
- Contract: write the value to stdout, exit 0. A non-zero exit means "no sample"
  and is logged.
- Writing to stdout is preferred over putting directly, so an agent can be run
  and inspected alone.
- Agents are stateless and idempotent. Running one twice is harmless.
- A **counter** in a project config names the key, its schedule and its command:

      "disk.c": { "schedule": "*/5 * * * *",
                  "command": "pwsh -NoProfile -File agents/disk.c.ps1" }

  - A counter with neither schedule nor command is a declared key nothing runs
    for: it exists to carry a `samples` policy for a value pushed in by hand.
  - The command runs with the config file's own directory as its working
    directory, so a relative path is project-local.
  - `"startup": true` also runs the counter once when the runner starts, on top
    of its schedule, so a daily counter fills its card after a restart.
- `runner.js` reads the same configs as the server, runs commands on schedule,
  and puts stdout to the counter's key.
  - Separate process from the web server, restartable independently. For the
    simple setup, `server.js --with-runner` runs it inside the server instead;
    it still puts over HTTP, so the server still knows nothing about agents.
  - Configs are read at startup, so restart the runner after editing a schedule.
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
  default. Tabs of every loaded project sit in the same bar, in config order,
  each under its own label. Tab names are global, so two projects cannot both
  call a tab `git`.
- **Countdown** — each card says when its own data is next expected, in the
  right corner of its label row.
  - The time is to the next scheduled run of the counter that writes the card's
    key, as the largest unit that fits: `3h` above an hour, `12m` above a
    minute, `45s` below one.
  - A scheduled minute that passes without the key being written reads `due`,
    and `stale` once it has stayed unwritten for more than five seconds.
  - A card whose key has no counter, or whose counter has no schedule, shows
    nothing. Two cards on the same key always agree, because the countdown is a
    property of the key, not of the card.

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
- On the same 5s beat it polls `GET /api/next/<keys on the active tab>` and
  repaints the card countdowns, so they are never more than five seconds out.
- Chart cards additionally poll their own `/api/history/...` on a longer
  interval.
- A screen wake lock is held while the page is visible, so it survives on a wall
  display.

## 10. Cards and renderers

- A card is a config entry; a renderer is a function. Cards are data, renderers
  are code.
- The page owns the card's chrome — its label and its countdown — and the
  renderer owns only the body. A renderer never draws the label row.
- Card config fields:
  - `key` — the key to read. Required except for renderers that read nothing.
  - `label` — the heading shown on the card.
  - `render` — renderer name.
  - `width`, `height` — grid steps. Optional, default 6.
  - `left`, `top` — grid steps. Optional; omit to let the card flow (see
    Layout).
  - `params` — renderer-specific object. Everything variable lives here, nothing
    at the top level.
- A renderer is one file, `renderers/<name>.js`, default-exporting `(el, value,
  params, ctx) => void`.
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
- `table` — a JSON array as columns. `params`: `columns`, `limit`, `empty`.
- `git` — a git working folder: branch, commit, remote position and what is
  uncommitted. `params`: `empty`.

### Custom cards

- A card needing a purpose-built view gets its own renderer named for the task
  (`renderers/calendar-due.js`), never a new card type in the server.
- Data _shaping_ belongs in the agent, not the renderer. "Calendar items due
  within 5 days" is an agent that queries the calendar and puts the filtered
  list; the renderer just draws rows.
- Rule of thumb: if the change is about _what_ is shown, edit the agent. About
  _how_, edit the renderer.

## 11. Project configuration

- One JSON file per project, hand- and CLI-editable, read by the server and by
  the runner. `dash.config.json` is the conventional name.
- The server and the runner take `--config <path>`, repeatable. Without it,
  `DASH_CONFIG` is read as a path list, and failing that the package's own
  `dash.config.json` is used.
- One file carries all four of a project's concerns: where its database is, how
  long samples are kept, which counters feed it, and which tabs it shows.

```json
{
  "project": "asljs",
  "label": "ASLJS",
  "db": "dash.sqlite",
  "samples": "database, 90*24h, 100k, 100Mb",

  "counters": {
    "asljs.git": {
      "schedule": "*/2 * * * *",
      "command": "pwsh -NoProfile -File dash/agents/git.ps1",
      "samples": "database, 30*24h, 5k, 5Mb"
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

- `project` is required and matches `[a-zA-Z0-9_.-]+`. `label` defaults to it.
- `db` and every relative command path resolve against the config's own
  directory, so a project config travels with its project. `db` defaults to
  `DASH_DB`, and failing that to `dash.sqlite` beside the config.
- `samples` at the top level is the project's default policy; a counter's own
  `samples` overrides it for that key.
- Tabs and cards are as before: the first tab in the first config is the
  default, and tab order in the files is tab order in the bar.
- Several cards may read the same key. Keys and cards are independent.
- Names are global across every loaded config: project names, keys and tab names
  must each be unique. A duplicate is reported on stderr naming the config that
  claimed it first, and the later one is ignored.
- A file that does not parse at all is reported and skipped; the other projects
  still load. Card-level errors show on the card, never thrown, and a missing
  renderer draws a visible placeholder.
- Configs are reloaded when they change on disk, so editing a card needs a page
  reload, not a server restart. The runner reads them once, at startup.

## 12. Typical workflow

Adding a monitor, end to end:

1. Write `agents/<key>.ps1` (or any executable) that prints the value to stdout.
2. Run it by hand once; confirm the output is the shape the renderer wants.
3. Add a counter to the project's config: key, schedule, command, and a
   `samples` policy if the default does not suit.
4. Add a card to the right tab of the same file — key, label, renderer,
   geometry, params.
5. Restart the cron runner. Reload the page.

Variations:

- New view of existing data: step 4 only.
- New shape of data: steps 1–4, plus a renderer if no built-in fits.
- New project: one more config file and one more `--config`.
- Retire a monitor: remove the counter and the card. Samples stay until the
  policy that was in force trims them.

## 13. File map

```
dash/
  src/
    server.js         Express app: put, get, history, dashboards, page
    runner.js         runs each counter's command on its schedule
    cron.js           the cron expression: parse, match, next and previous
    store.js          the sticky put, get and history, one store per project
    config.js         project configs: counters, tabs, policies, key routing
    samples.js        the policy syntax "<store>, <retention>, <count>, <quota>"
    schema.sql        the one table and its index
    index.html        shell: top bar, grid, Pico CSS
    dash.js           page loop: fetch config, place cards, poll values
    layout.js         virtual-screen card placement
    renderers/        one file per renderer
  dash.sqlite         the machine project's store (gitignored)
  dash.config.json    the machine project: db, counters and tabs
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

- Two processes: `node src/server.js` and `node src/runner.js`, both given the
  same `--config` list. Either restarts alone. From the repository root: `npm -w
  asljs-dash run start` and `run runner`, which pass the repository's own
  configs. `node src/server.js --with-runner` folds both into one process (`run
  start:with-runner`).
- ES modules throughout, server and page alike, as the rest of the repository.
- Port from `PORT`, default 3000. Configs from `--config` or `DASH_CONFIG`; see
  docs/operations.md.
- Restarting no longer loses values — that is the point of SQLite.
- Logs go to stdout. The runner logs each run's key, exit code, and duration.
- Backup is copying each project's `dash.sqlite`.

## 15. Decisions worth not revisiting

- **Append-on-change samples, newest-wins reads.** Makes history free, keeps the
  store small, and makes "when did this last change" answerable without
  scanning.
- **Text API.** Any shell can feed the dashboard in one line; no client library
  is ever needed.
- **Agents shape, renderers draw.** Keeps renderers small and reusable, and
  keeps task-specific logic somewhere it can be run and tested on its own.
- **JSON config, no editor.** The intended editor is an AI coding agent.
- **One file per project, several projects at once.** A project's database, its
  counters and its dashboard are one thing to read, one thing to copy and one
  thing to delete, and `--config` is the only thing that joins them.
- **One global key namespace.** A key names exactly one counter, so
  `/api/get/:key` stays a single word and the routing to a project's database is
  the server's business, not the caller's.
- **No build step.** `index.html` and `renderers/*.js` are served as written, as
  ES modules.
