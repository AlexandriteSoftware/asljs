# REFERENCE

## Package Identity

- Package name: `asljs-part`
- Runtime entrypoints: the `part` CLI and the package-root JavaScript exports

## Public Exports

The package-root export surface includes:

- `runCli`
- `Definition`
- `DefinitionProvider`
- `GitIgnore`
- `buildInventoryReport`
- `buildArtefactDefinitionReport`
- `buildCheckReport`
- `generateInventoryTable`

## Definition Format

Stable definition behavior:

- A definition is a markdown file whose level 1 heading matches the file name.
- A valid definition includes a `Location` section.
- `Properties` list items map markdown labels to normalized property names for
  rule input.
- `Rules` list items use IDs such as `R1` or `RL10` and can include an optional
  `-` separator before the description.

Rule file resolution behavior:

- PART first looks for rule files in a sibling `rules/` directory next to the
  definition.
- PART also supports fallback rule files under the repository `part/` folder.
- JavaScript rule files are expected to export `validate(...)`.

## Discovery Behavior

- `DefinitionProvider` discovers markdown definitions from visible files under
  the chosen definitions path.
- Definition discovery respects `.gitignore` filtering.
- Artefact discovery uses the definition `Location` pattern and optional
  `Exclude` entries.
- Artefact locations opt into `.gitignore` filtering only when the definition
  includes `GitIgnore` in its `Location` section.

## CLI Contract

### version

- Prints the package version from `package.json`.

### inventory

- Scans artefacts matched by discovered definitions.
- Shows all definitions that apply to the same artefact.
- Reports `Fail` when any contributing rule fails.

### artefactdefinition

- Without a target, lists discovered definitions.
- With a target, prints the selected definition in detail.

### check

- Runs rules for artefacts matched by definitions and an optional path pattern.
- Aggregates rules from all definitions that apply to the same artefact.
- Returns a non-zero exit code when any rule fails.
- Shows only failing rows by default.
- `--with-positives` includes passing `OK` rows.
- Rows are sorted by path, then by rule.

## Preferred Usage Patterns

- Use the CLI when you want repository-local inventory or rule validation.
- Use the package-root report builders when you need to embed PART in another
  Node.js workflow.
- Keep definitions close to the artefacts or domains they describe and keep
  their rules in a sibling `rules/` directory when possible.
