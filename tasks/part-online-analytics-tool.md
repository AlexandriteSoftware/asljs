# part-online-analytics-tool

An online analytics tool for `part`. The item was recorded as three words with
no description, so this task first has to decide what it means; the options
below are readings of what `part` can produce today, not a recorded plan.

Package: `part`.

## Context

The item came from `part/TODO.md`, where it read "online analytics tool". It was
added in `408398e` together with the rest of that list (diagram support, project
and source dependency diagrams, multiple definition folders, presets, entity
stereotypes, a diagram editor, more diagram types), and moved to `tasks/` in
`6484647` with its wording kept. Neither commit, nor any other in the history,
says what would be analysed, for whom, or where it would run. `git log -S
"analytics"` finds only those two commits and a `pages` branch publish.

`part` is a Node.js CLI. What it can output today:

- `part inventory` prints a markdown table of artefacts and the definitions that
  apply to them. `--format` selects `table`, `diagram` or `json`
  ([inventory.ts][INV]):

  ```ts
  function getInventoryFormat(
      format: string | undefined
    ): 'table' | 'diagram' | 'json'
  ```

  `diagram` builds a Mermaid graph and renders it to SVG by spawning `mmdc` from
  the bundled `@mermaid-js/mermaid-cli` ([RQ206][R206]).
- `part check` runs every applicable rule against every artefact and prints only
  a markdown table; it has no `--format` option ([check.ts][CHK]):

  ```ts
  const table =
    renderObjectsToMarkdownTable(
      [ { property: 'location',
          name: 'Location' },
        { property: 'rule',
          name: 'Rule' },
        { property: 'result',
          name: 'Result' } ],
      results);
  ```

  It exits non-zero when any rule fails, hides `OK` rows unless
  `--with-positives` is given and `Skip` rows unless `--with-skipped` is given.
  Results of file artefacts are cached in `.part/check-cache.json`
  ([RQ136][R136]), and `--ai` sends rules without an implementation to an AI
  agent ([RQ137][R137]). [index.ts][IDX] exports `runCli`, the providers, the
  plugin types and the package plugin; there are no report builders on the
  public surface.

Rules are code taken from the analysed repository: definition sources are
plugins, which [definition-source-provider.ts][DSP] imports with `await
import(source.url)`, and [rule-runner.ts][RUN] calls their rule functions or
runs an AI agent command. Discovery uses `node:fs`, `glob` and `.gitignore`
filtering throughout `src/providers/`.

In this repository, `npx part check --definitions aftefacts` (after `npm -w
asljs-artefacts run build:dist`) currently reports 46 failing rows: 41
`Article_RL1` heading mismatches, 4 `Package README_RL1` and 1 `Article_RL3`.

What already exists for hosting and history:

- [Build Site][WF], the only workflow, builds the markdown site with
  `apps/app-builder` and MkDocs and force-pushes it to the `pages` branch,
  served at `https://alexandritesoftware.github.io/asljs/`. It runs on pushes to
  `main` that touch `apps/app-builder/**` or `**/*.md`. It already runs `npm
  ci`, so `part` is installed in that job. `part`'s README is published there as
  `apps/part/index.html`.
- [dash][DSH] is a single-machine dashboard: scheduled agents print a value, an
  Express server stores changes in SQLite and a static page renders cards. It
  keeps history per key. Accounts, sharing and anything beyond one machine are
  out of scope.
- `apps/app-builder` also holds a browser-only demo app (Vite, IndexedDB via
  `asljs-dali`, `asljs-components`), run locally and not published.

## Problem

The intent was not recorded, and the words fit at least three different products
with very different costs. Without a decision the task cannot be started, and
some readings conflict with how `part` works: it executes code from the
repository it analyses, and it depends on Node.js APIs and a headless browser
for diagrams.

## Options

**A. `part` in the browser, on an uploaded folder or a GitHub URL.** A page
where a visitor points at a repository and sees its inventory, check results and
diagram.

- Pros: closest to the literal words; useful to people who have not installed
  `part`; would also serve as the package's demo.
- Cons: the largest change by far. File access, globbing and `.gitignore`
  handling would need a browser abstraction behind the providers. Plugins would
  have to be imported from in-memory sources, and AI checks need an agent
  command that a browser cannot run. Running another repository's rule code in a
  visitor's browser needs a sandbox decision. The diagram path depends on `mmdc`
  and would need Mermaid in the page instead. A server-side variant avoids the
  browser port but runs untrusted code on a host this repository does not have.

**B. A dashboard with history of `part check` results.** Track how many rules
fail over time, per definition or per rule.

- Pros: "analytics" fits trends better than a single report. `dash` already
  stores and renders history, so a counter whose command runs `part check` and
  prints a number needs no new infrastructure.
- Cons: `dash` is local to one machine by design, so this is not "online". Doing
  it properly wants a machine-readable `check` output rather than counting table
  rows. A hosted version with history means storage and a server this repository
  does not run.

**C. A static report generated by `part` and published from CI.** The site
workflow runs `part inventory` and `part check` and publishes the result as
pages next to the existing site.

- Pros: reuses the existing pipeline and host; no server, no untrusted code
  beyond this repository's own rules; the work splits into small steps, the
  first of which (a `--format=json` for `check`, matching `inventory`) is useful
  on its own for scripts and for option B.
- Cons: covers only this repository, not any visitor's. Shows a snapshot, not
  trends, unless earlier results are kept somewhere. Publishes the failing rows
  publicly. The workflow has to tolerate `check`'s non-zero exit code, and its
  path filter would need to include the files the rules check (`**/*.md` already
  covers most of today's rules). Rendering needs either a new HTML format in
  `part` or a page in `apps/app-builder` that reads the JSON.

Recommendation: narrow the task to option C, starting with a `--format=json` for
`part check`, and treat A as out of scope unless the intent was explicitly a
public tool for other repositories. A is a port of the whole package with an
open security question, while C delivers a visible report from parts that
already exist, and its first step also unblocks B. If no one can say what the
item was meant to give, deleting the task is a reasonable outcome too.

## Points to settle

- Which reading was meant, or whether to drop the item.
- Audience: the maintainer only, or the public; and whether this repository's
  failing rows may be published.
- Scope: this repository only, or any repository.
- Content: check results, inventory, the inventory diagram, or all of them.
- Whether history and trends are required, and if so where results are stored.
- The machine-readable `check` output: its shape, and whether cached and AI
  results are marked in it.
- Where rendering lives: a new format in `part`, or a page built by
  `apps/app-builder` from `part` output.
- When CI runs it: the current site trigger, or its own workflow.

## Where

- `apps/part/src/commands/check.ts` - the check report, markdown table only.
- `apps/part/src/commands/inventory.ts` - `table`, `diagram` and `json` formats.
- `apps/part/src/providers/definition-source-provider.ts` - imports plugins.
- `apps/part/src/rule-runner.ts` - runs plugin rules and AI checks, with the
  cache.
- `apps/part/src/providers/` - file discovery on `node:fs` and `glob`.
- `apps/part/src/index.ts` - the public surface, without report builders.
- `apps/part/development/RQ123 CLI Check action.md` - the check contract.
- `.github/workflows/build-app-builder.yml` - builds and publishes the site to
  `pages`.
- `apps/app-builder/` - the site builder and the browser demo app.
- `apps/dash/` - local dashboard with per-key history.

[INV]: ../apps/part/src/commands/inventory.ts
[CHK]: ../apps/part/src/commands/check.ts
[IDX]: ../apps/part/src/index.ts
[DSP]: ../apps/part/src/providers/definition-source-provider.ts
[RUN]: ../apps/part/src/rule-runner.ts
[R136]: <../apps/part/development/RQ136 CLI Check cache.md>
[R137]: <../apps/part/development/RQ137 CLI AI check.md>
[R206]: <../apps/part/development/RQ206 Diagram.md>
[WF]: ../.github/workflows/build-app-builder.yml
[DSH]: ../apps/dash/README.md
