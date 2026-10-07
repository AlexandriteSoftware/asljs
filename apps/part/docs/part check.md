# part check

Runs the rules of the loaded definitions against their artefacts and reports the
failures. It exits with a non-zero code when any rule fails.

```text
part check [<pattern>] [--check-definitions <names>] [--check-rules <rules>]
           [--with-positives] [--with-skipped] [--force-check]
           [--ai [claude|copilot]]
```

```bash
part check --definitions artefacts --definitions "asljs-part;Article"
```

```text
| Location  | Rule        | Result                                  |
| --------- | ----------- | --------------------------------------- |
| README.md | Article_RL1 | Article heading must be "# README", ... |
```

A rule runs as code when a plugin implements it. Otherwise it is skipped, or
checked by an AI agent with `--ai`.

## Options

- `<pattern>` - a glob; only matching artefacts are checked. A pattern with a
  scheme, e.g. `git:tag/v*`, matches locations; any other pattern is a path
  relative to the working directory.
- `--check-definitions <names>` - comma-separated definition names to check.
- `--check-rules <rules>` - comma-separated rules, `<Definition>_<rule id>`,
  e.g. `Article_RL1`.
- `--with-positives` - show passing rows too.
- `--with-skipped` - show rows of rules no plugin implements.
- `--force-check` - run every rule, ignoring the cache.
- `--ai [agent]` - check rules no plugin implements with `claude` (default) or
  `copilot`. `PART_AI_COMMAND` replaces the agent command. AI results end with
  `(AI)`.

## Cache

Results of file artefacts are cached in `.part/check-cache.json`, which is meant
to be gitignored. A rule runs again only when the file changed after its last
check, the rule text changed, or the version of the plugin that implements it
changed. A change in another file the rule reads does not rerun it; use
`--force-check`.

## See also

- [Options][OPT] - the options every action takes.
- [RQ123 CLI Check action][RQ123], [RQ136 CLI Check cache][RQ136] and
  [RQ137 CLI AI check][RQ137] - the requirements.

[OPT]: Options.md
[RQ123]: <../development/RQ123 CLI Check action.md>
[RQ136]: <../development/RQ136 CLI Check cache.md>
[RQ137]: <../development/RQ137 CLI AI check.md>
