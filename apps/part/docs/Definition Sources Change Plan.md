# Definition Sources Change Plan

Status: approved and implemented. The decisions now live in the requirements
under `development` (RQ111, RQ112, RQ136, RQ137, RQ207) and in the package
documentation.

Base: commit `part: implement artefact definitions through plugins`, which added
`--plugin`, the plugin runtime, `Skip` results and the built-in plugins.

## Request

1. One argument takes every source of definitions: an md-only folder, a plugin
   library folder (has `package.json`), or a plugin file. No separate
   `--plugin`.
2. Check a rule again only when the artefact changed after the last check,
   unless `--force-check` is given. Needs a check cache.
3. An argument that runs rules without an implementation through an AI agent,
   Copilot or Claude.

Correction to the request: part never had an `--artefacts` key. The key that
takes the definitions folder is `--definitions` (with `PART_DEFINITIONS`); it
stays and gains the plugin forms.

## Decisions

### Definition Sources

- D1. `--definitions` stays and is repeatable; `PART_DEFINITIONS` takes a list
  separated by the platform path delimiter. `--plugin` and `PART_PLUGINS` are
  removed. Without `--definitions` (and without `PART_DEFINITIONS`) there are no
  sources and no definitions.
- D2. Each value is one of:
  - a folder without `package.json` - md-only: its `*.md` definitions (heading
    matches file name, `.gitignore` respected, as today). No rule has an
    implementation;
  - a folder with `package.json` - plugin library: its package entry
    (`exports['.']`, else `main`) is imported and its default export is called
    as the plugin factory;
  - a `.js` file - plugin file, imported the same way;
  - anything else - a package specifier, e.g. `asljs-part/plugins/npm`, resolved
    from the project root, then from `asljs-part`.
- D3. A plugin provides all of its definitions. Its `*.md` files are not read
  unless the plugin reads them. A helper reads a folder of definition documents
  for plugins that want it (see 2 below).
- D4. Sources are merged. Definition names stay unique across sources; a clash
  is fatal. Rule implementations, data functions and locators of a plugin bind
  to definitions of any source, as today.

### Check Cache

Resolved in review: no `--definitions` means no definitions (was A1); folders
use their own mtime (was A3); plugin `version` replaces module mtime (was A4).

- D5. Results are cached in `<project>/.part/check-cache.json`, meant to be
  gitignored.
- D6. A cached result is reused when all of these hold, otherwise the rule runs
  again:
  - the artefact is a `file:` artefact and its mtime is not newer than the
    cached check time; for a folder, the folder's own mtime, assuming changes to
    files inside it do not change the result;
  - the rule text is unchanged (hash of the rule content);
  - the plugin implementing the rule has the same `version` as when cached.
    Plugins gain an optional `version` string; changing it invalidates every
    cache record that plugin produced. Nothing else about a plugin (its files,
    imports, mtimes) affects the cache;
  - the result was produced the same way (code, AI, or not run), see D11.
- D7. Only `file:` artefacts are cached. Non-file artefacts (git tags, npm
  dependencies) are always checked.
- D8. A reused result is replayed: the row is shown as if the rule ran, and a
  cached failure still makes the exit code non-zero.
- D9. `--force-check` runs every selected rule and refreshes the cache.

### AI Check

- D10. `--ai` runs rules without an implementation through an AI agent. `--ai`
  alone uses Claude; `--ai=copilot` uses Copilot; `--ai=claude` is explicit.
  `PART_AI_COMMAND` overrides the command; the prompt goes to its standard
  input.
- D11. Only rules without an implementation go to the agent. Rules with an
  implementation run as code. Without `--ai` such rules stay `Skip`.
- D12. The agent may read the repository but not change it. The prompt holds the
  definition name and description, the rule text, and the artefact location,
  with the absolute path for `file:` artefacts. The agent answers with one JSON
  line `{"result":"OK"|"Fail","message":"..."}`. A failed run or output without
  that line is a failure with the reason. AI results are cached like code
  results.

## Assumptions to Confirm

- A2. A plugin library whose `package.json` has neither `exports['.']` nor
  `main` is a fatal error, not a fallback to md-only.
- A4. Known limit of D6: a change in another artefact a rule reads (e.g.
  `Requirement` RL10 reads test files) does not invalidate the cache. Use
  `--force-check`. A plugin without `version` counts as version `""`.
- A5. `Skip` results are not cached; they cost nothing to recompute.
- A6. The cache drops entries for artefacts or rules that no longer exist when
  it is written. A missing or unreadable cache file is treated as empty and
  rewritten.
- A7. Commands: Claude runs `claude -p --allowedTools Read,Grep,Glob` with the
  prompt on standard input; Copilot runs `copilot -p <prompt>` with tools
  limited to reading. The exact Copilot flags are verified against the installed
  CLI during implementation. Both run in the project root.
- A8. AI rows look like code rows: `OK` or the failure message. The `Result` of
  an AI row is suffixed with ` (AI)`, e.g. `OK (AI)`, so readers can tell them
  apart.
- A9. AI checks run one at a time.

## Change Plan

### 1. Sources

- `src/providers/plugin-provider.ts` becomes a definition source loader: it
  classifies each `--definitions` value (D2), reads md-only folders, imports
  plugin files, libraries and packages, and keeps the binding validation and
  fatal errors it has today.
- `ArtefactDefinitionProvider` takes its definitions from the loaded sources
  instead of scanning one `definitionsPath`. A definition keeps `path` for
  documents and gains nothing else; `source` is `markdown` for md-only folders
  and the plugin name for plugins.
- `Environment.definitions` becomes `string[]`; `Environment.plugins` is
  removed. `providersFactory` and `createRuleValidationContext` take the list of
  sources instead of `definitionsPath` and `plugins`.
- `PluginContext.definitionsPath` becomes the plugin's own folder (`folder`), so
  a library can find its documents.
- `config` prints the sources.

### 2. Helper for Plugins

- `PluginContext.readDefinitions(folder)` returns the definitions documented in
  `*.md` files of a folder (same parsing as md-only folders). Also exported from
  the package root as `readMarkdownDefinitions(folder)` for use outside a
  factory. Plugin definitions from documents keep `path`, so `definition` prints
  it.

### 3. Check Cache

- New `src/providers/check-cache.ts`: load, look up, store and save
  `.part/check-cache.json`. Entry key: location and rule name; value: checked
  time, rule content hash, implementing plugin name and version, mode (`code` or
  `ai`), result and message.
- `Plugin` gains `version?: string`.
- `RuleRunner` asks the cache before running and stores after (D6-D9, A5).
- `check` gains `--force-check`; it saves the cache at the end.
- Repository `.gitignore` gets `.part/`.

### 4. AI Check

- New `src/ai-runner.ts`: builds the prompt, runs the agent command (A7) or
  `PART_AI_COMMAND`, parses the JSON verdict (D12).
- `RuleRunner` sends unimplemented rules to it when `--ai` is set (D11).
- `check` gains `--ai [agent]`.
- Tests use `PART_AI_COMMAND` pointing at a stub script; no real agent runs in
  tests.

### 5. Repository and Documentation

- `aftefacts/package.json` (private, `type: module`, `main: plugin.js`) makes
  `aftefacts` a plugin library; `plugin.js` uses `readDefinitions` for its
  documents and declares a `version`. The command becomes `part check
  --definitions aftefacts`.
- Requirements: update RQ111, RQ112, RQ123, RQ201, RQ207; replace RQ134 and
  RQ135 (plugin parameter and variable) with the source forms in RQ111 and
  RQ112; add RQ136 `--force-check` and check cache, RQ137 `--ai`.
- `README.md`, `AGENTS.md` of part and the root `AGENTS.md` updated for the new
  arguments.
- Version `0.3.0` (breaking: `--plugin`, `PART_PLUGINS` and `definitionsPath` in
  the API go away). One commit, no release.

### 6. Verification

- `npm -w asljs-part run test`, `typecheck`, `flint`.
- `part check --definitions aftefacts` gives the same rows as today; a second
  run reuses the cache, and `--force-check` runs everything again.
- `part check --definitions <md-only folder> --ai` against a stub command and,
  once by hand, against the installed Claude CLI.
