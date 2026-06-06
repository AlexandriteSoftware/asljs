# RQ123 Check action

When CLI is invoked with Check action, it obtains all artefact definitions,
gets list of artefacts and list of rules per definition, and runs rule function
for each file and rule. If multiple definitions apply to the same path, it
runs rules from all of those definitions.

Parameters:

- pattern - optional, positional parameter after the `check` command, e.g.
  `check src/**/*.js`
- definitions - limit check to specific definitions, comma-separated list.
- rules - limit check to specific rules (in format
  `<artefact definition>_<rule id>`), comma-separated list.
- with-positives - flag, if set, show all rows including `OK`; otherwise only
  failing rows are shown.

Check returns non-zero exit code if any of the rules fails for any of
the artefacts.

It prints a report with these columns:

- `Path` - path to the file or folder.
- `Rule` - Id of the rule.
- `Result` - `OK` if the rule passes, message from the rule, if it fails.

One row per path and rule. Sorted by path, then by rule. E.g.,

```markdown
| Path           | Rule             | Result            |
|----------------|------------------|-------------------|
| src/index.js   | JS File_RL1      | OK                |
| src/index.js   | JS File_RL2      | Missing semicolon |
| src/index.js   | Project File_RL1 | No maintainer     |
```
