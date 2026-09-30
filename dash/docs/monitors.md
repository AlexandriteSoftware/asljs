# Adding a monitor

## Purpose

The four files a monitor touches — an agent, a `cronfile` line, a card in
`dashboards.json`, and optionally a policy in `samples.json` — and what each one
accepts.

## The agent

One file per monitor in `agents/`, named after its key.

- Write the value to stdout and exit `0`. A non-zero exit means "no sample" and
  is logged instead of stored.
- Any executable, or a script run through one: `pwsh`, `node`, `python`, `cmd`.
- Agents are stateless and idempotent. Running one twice is harmless, and
  running one by hand is how you check its output shape.
- Prefer printing over putting directly, so the agent can be inspected alone.

```powershell
# agents/disk.c.ps1
$drive = Get-PSDrive -Name C
[pscustomobject]@{ freePercent = [math]::Round($drive.Free / ($drive.Used + $drive.Free) * 100, 1) } |
    ConvertTo-Json -Compress
```

Use `[ordered]@{}` for PowerShell hashtables. Unordered ones shuffle their JSON
keys between runs, which makes every run look like a change and defeats
stickiness.

## The schedule

One line per agent in `cronfile`:

```
<min> <hour> <dom> <month> <dow>   <key>   <command...>
*/5   *      *     *       *       disk.c  pwsh -NoProfile -File agents/disk.c.ps1
```

- The five cron fields support `*`, lists (`1,15`), ranges (`1-5`) and steps
  (`*/5`). Day-of-week accepts both `0` and `7` for Sunday.
- Everything after the key is the command line, handed to the shell as one
  string. Quoting is the line author's business, as in any crontab.
- Lines starting with `#` are comments. A line that does not parse is reported
  with its line number and skipped; the rest of the file still runs.
- The runner reads `cronfile` at startup, so restart it after an edit.

## The card

One entry in the right tab of `dashboards.json`:

```json
{ "key": "disk.c", "label": "Disk C: free", "render": "value",
  "params": { "field": "freePercent", "unit": "%" } }
```

- `width` and `height` default to 6 grid steps.
- `left` and `top` are optional. Cards without them flow into the first gap that
  fits, in list order, so reordering the list rearranges the tab.
- Several cards may read the same key; keys and cards are independent.
- The config is re-read per request, so a card edit needs a page reload, not a
  server restart.
- A config error shows on the card rather than being thrown, and a missing
  renderer draws a visible placeholder.

## Renderers

One file each in `renderers/`, picked by a card's `render`:

- `value` — one big number or word. `params`: `field`, `unit`, `precision`,
  `prefix`.
- `text` — preformatted text, scrollable, for command output. `params`: `wrap`.
- `chart` — a line or bar over history. `params`: `field`, `limit`, `kind`,
  `min`, `max`.
- `list` — rows from a JSON array. `params`: `fields`, `limit`, `empty`.
- `status` — a status word plus message, coloured `ok`, `warn` or `error` from a
  `status` field or a bare string. `params`: `labels`.
- `table` — a JSON array as columns. `params`: `columns`.

`params.field` selects a field out of an object value, and accepts a dotted path
for nested ones. Adding a renderer is adding a file; see
[concept.md](concept.md) for the contract it implements.

## How long samples are kept

`samples.json` decides, per key, where samples live and how many survive:

```json
{
  "default": "database, 90*24h, 100k, 100Mb",

  "keys": {
    "ping.gw": "database, 30*24h, 50k, 20Mb",
    "top.cpu": "memory, 1h, 200, 2Mb"
  }
}
```

Four fields, in order:

- `store` — `memory`, which is process-local and lost on restart and never
  touches SQLite, or `database`.
- `retention` — how long a sample is kept, counted from when it was last
  confirmed current. Suffixes `s` (the default), `m`, `h`.
- `count` — how many samples the key may hold. Suffixes `k`, `M`, `G`, decimal.
- `quota` — total size of the key's values as UTF-8 bytes. Suffixes `Kb`, `Mb`,
  `Gb`, 1024-based.

Rules:

- Suffixes are case-insensitive, and any field may be written as a product, so
  `90*24h` is 90 days.
- There is no unlimited option. Every field must be greater than zero, which
  makes `memory, 0, 0, 0` an error.
- Whichever limit bites first wins, and the oldest sample goes first. The quota
  never evicts the newest sample, because that sample is the key's current
  value.
- Keys you do not list get the `default` entry.
- The file is read at startup and reloaded when you save it, with no restart.

## Retiring a monitor

Remove the `cronfile` line and the card. Samples stay until the key's
`samples.json` policy trims them, and `/api/keys` keeps reporting the key until
the last one is gone.
