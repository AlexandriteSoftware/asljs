# RQ123 CLI Check action

When CLI is invoked with Check action, it obtains all artefact definitions, gets
list of artefacts and list of rules per definition, and runs the rule
implementation for each artefact and rule. If multiple definitions apply to the
same artefact, it runs rules from all of those definitions.

A rule implementation is provided by a plugin, see [RQ207][RQ207]. A rule no
plugin implements is checked by an AI agent with `--ai` (see [RQ137][RQ137]);
otherwise it is not run and its result is `Skip`. Results of `file:` artefacts
are cached and reused, see [RQ136][RQ136].

Parameters:

- `<pattern>` - optional, positional parameter after the `check` command, e.g.
  `check src/**/*.js`. A glob matched against the printed location:
  - a pattern with a scheme, e.g. `git:tag/v*`, matches full locations;
  - any other pattern is a path relative to the working directory and matches
    `file:` artefacts only.
- `--check-definitions=...` - limit check to specific definitions,
  comma-separated list.
- `--check-rules=...` - limit check to specific rules (in format `<artefact
  definition>_<rule id>`), comma-separated list.
- `--with-positives` - flag, if set, show `OK` rows.
- `--with-skipped` - flag, if set, show `Skip` rows.
- `--force-check` - flag, if set, run every rule, ignoring cached results.
- `--ai [agent]` - check rules no plugin implements with `claude` (default) or
  `copilot`.

Without the flags only failing rows are shown.

Check returns non-zero exit code if any of the rules fails for any of the
artefacts. `Skip` does not change the exit code.

It prints a report with these columns:

- `Location` - the printed location: the path relative to the project root for
  `file:` artefacts, the full location otherwise.
- `Rule` - `<artefact definition>_<rule id>`.
- `Result` - `OK` if the rule passes, `Skip` if no plugin implements it and no
  AI agent is used, the message from the rule if it fails. Results of an AI
  check end with ` (AI)`.

One row per location and rule. Sorted by location, then by rule. E.g.,

```markdown
| Location     | Rule             | Result            |
|--------------|------------------|-------------------|
| src/index.js | JS File_RL1      | OK                |
| src/index.js | JS File_RL2      | Missing semicolon |
| src/index.js | Project File_RL1 | Skip              |
```

[RQ136]: <RQ136 CLI Check cache.md>
[RQ137]: <RQ137 CLI AI check.md>
[RQ207]: <RQ207 Plugin.md>
