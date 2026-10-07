# RQ121 CLI Inventory action

Inventory command enumerates the artefacts of all definitions and for each of
them lists all artefact definitions that apply to it. Artefacts are located as
described in [RQ204][RQ204].

Parameters:

- `--inventory-definitions=...` - limit check to specific definitions,
  comma-separated list.
- `--format=...` - output format, either `table` (default), `diagram`, or
  `json`.
- `--with-properties` - optional comma-separated list of definition properties
  `<Definition>.<Property>,...`.

See also:

- [RQ111 CLI Definitions parameter][1]

[1]: <RQ111 CLI Definitions parameter.md>
[RQ204]: <RQ204 ArtefactProvider.md>

## Report Properties

The produced report starts with these columns:

- `Location` - the printed location: the file or folder path relative to the
  project root for `file:` artefacts, the full location otherwise, e.g.
  `git:tag/v1.0.0`.
- `Definitions` - comma-separated list of all definitions that apply to the
  artefact.

When `--with-properties` is specified, additional columns are added for each
property requested, with the column name `<Definition>.<Property>`.

When `--with-properties` is provided as a list of properties, the report will
include only those properties for the definitions that apply to each artefact.

### Example: Report with two columns

```pwsh
part inventory --with-properties=Definition1.Property1,Definition2.Property1
```

Should produce a report with the following columns:

- `Location`
- `Definitions`
- `Definition1.Property1`
- `Definition2.Property1`

### Example: Report with all properties

```pwsh
part inventory --with-properties
```

### Example: Report with no properties

```pwsh
part inventory
```

## Report Formats

### `table`

The default format is a Markdown table, with one row per artefact and one column
per property requested.

```markdown
| Location | Definitions | Definition1.Property1 | Definition2.Property1 |
| -------- | ----------- | --------------------- | --------------------- |
| ...      | ...         | ...                   | ...                   |
```

### `json`

The `json` format produces a JSON array of objects, one per artefact.

```json
[
  {
    "location": "...",
    "Definition1": { "Property1": "...", ... },
    "Definition2": { "Property1": "...", ... }
  },
  ...
]
```

### `diagram`

The `diagram` format produces a Mermaid diagram, with one node per artefact and
one edge per `Artefact` property linking to another artefact, if it is on the
diagram. A property value with a scheme is a location; any other value is a path
relative to the referencing `file:` artefact.

```mermaid
graph TD
  Artefact1
  Artefact2

  Artefact1 --> Artefact2
```
