# Adding a monitor

## Purpose

What a monitor is made of — an agent, a counter in a project config, and a card
in the same file — and what each one accepts.

## The agent

One file per monitor. The agents dash ships live in `agents/`, named after their
key; a project's own agents may live anywhere its counter's command can name.

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

## The counter

One entry in the project config's `counters`, under the key it feeds:

```json
"counters": {
  "disk.c": {
    "schedule": "*/5 * * * *",
    "command": "pwsh -NoProfile -File agents/disk.c.ps1",
    "samples": "database, 30*24h, 50k, 20Mb"
  }
}
```

- `schedule` is a five-field cron expression supporting `*`, lists (`1,15`),
  ranges (`1-5`) and steps (`*/5`). Day-of-week accepts both `0` and `7` for
  Sunday.
- `command` is a command line, handed to the shell as one string. Quoting is the
  config author's business, as in any crontab. It runs with the config file's
  own directory as its working directory, so a relative path is project-local.
- `samples` is optional; without it the key gets the project's default policy.
- `schedule` and `command` go together. A counter with neither is a key nothing
  runs for, which is how a value you push in by hand gets a policy of its own.
- A counter that does not parse is reported with its config and key and skipped;
  the rest of the file still runs.
- The runner reads the configs at startup, so restart it after an edit.
- The schedule also drives the card countdown: every card on the key shows the
  time to its next run, then `due` and `stale` if that run does not report. A
  key with no schedule shows nothing.

## The card

One entry in the right tab of the same config:

```json
{ "key": "disk.c", "label": "Disk C: free", "render": "value",
  "params": { "field": "freePercent", "unit": "%" } }
```

- `width` and `height` default to 6 grid steps.
- `left` and `top` are optional. Cards without them flow into the first gap that
  fits, in list order, so reordering the list rearranges the tab.
- Several cards may read the same key; keys and cards are independent, and a
  card may read a key another project declares.
- The server reloads a config when it changes, so a card edit needs a page
  reload, not a server restart.
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
- `git` — a git working folder: branch and commit, its position against the
  remote, and what is uncommitted. `params`: `empty`.

`params.field` selects a field out of an object value, and accepts a dotted path
for nested ones. Adding a renderer is adding a file; see
[concept.md](concept.md) for the contract it implements.

## Watching a git working folder

`agents/git.ps1` reports one repository. It takes `-Path`, and without it reads
the directory it is run in — which is the directory of the config that declares
the counter, so a project config sitting in its own repository needs no path at
all:

```json
"counters": {
  "asljs.git": {
    "schedule": "*/2 * * * *",
    "command": "pwsh -NoProfile -File dash/agents/git.ps1"
  }
}
```

It prints one object: `status`, `branch`, `commit` (short), `upstream`, `ahead`,
`behind`, `pushed`, `dirty`, `staged`, `changed`, `untracked`, `conflicted` and
a one-line `message`.

- `staged` counts entries with an index change, `changed` those with a worktree
  change; a file that is both counts in both.
- `pushed` is true when the branch has an upstream and is not ahead of it.
- `status` is `error` on a conflict, `warn` when the folder is dirty, behind, or
  has nothing to push to, and `ok` otherwise.
- The path not being a repository is a non-zero exit, so the runner records no
  sample and logs `git`'s own message.

Two renderers read it. `git` draws the full card — branch, commit with a
trailing `+` when dirty, the remote position, and a row per kind of pending
change. `status` draws the same value as a word and its `message`, which is the
compact version for a narrow card.

## How long samples are kept

A `samples` policy decides, per key, where samples live and how many survive.
The project's own line is the default, and a counter may override it:

```json
{
  "samples": "database, 90*24h, 100k, 100Mb",

  "counters": {
    "ping.gw": { "samples": "database, 30*24h, 50k, 20Mb" },
    "top.cpu": { "samples": "memory, 1h, 200, 2Mb" }
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
- A counter with no `samples` line gets the project's, and a key no config
  declares gets the first project's.
- Configs are read at startup and reloaded when you save one, with no restart.

## Retiring a monitor

Remove the counter and the card. Samples stay until the policy that was in force
trims them, and `/api/keys` keeps reporting the key until the last one is gone.

## Adding a project

A project is one more config file and one more `--config`:

1. Write `dash.config.json` in the project's own folder: a unique `project`
   name, its `db`, its counters and its tabs.
2. Pass it to both processes, after the configs already loaded.
3. Reload the page. Its tabs appear in the bar, after the ones already there.

Project names, keys and tab names are global across every loaded config, so pick
names no other project uses — `asljs.git` rather than `git`. A duplicate is
reported on stderr and ignored, and the config that claimed it first keeps it.
