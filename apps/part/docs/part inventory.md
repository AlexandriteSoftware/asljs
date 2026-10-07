# part inventory

Lists the artefacts of the loaded definitions, with the definitions each one
matches and, on request, their property values.

```text
part inventory [--inventory-definitions <names>] [--format table|json]
               [--with-properties [<Definition>.<Property>,...]]
```

```bash
part inventory --definitions artefacts --with-properties
```

```text
| Location                          | Definitions | Todo Item.Due |
| --------------------------------- | ----------- | ------------- |
| Todo Items/Review Requirements.md | Todo Item   | 2030-07-01    |
```

## Options

- `--inventory-definitions <names>` - comma-separated definition names; only
  their artefacts are listed.
- `--format table` (default) prints a markdown table; `--format json` prints an
  array with one object per artefact, holding its location and the raw property
  values of each definition.
- `--with-properties` adds a column for every property; with a list of
  `<Definition>.<Property>` it adds only those. An unknown property is an error.

The location is the path relative to the project root for files, and the full
location otherwise, e.g. `git:tag/v1.0.0`.

To draw the artefacts and their references, use [part diagram][DIA].

## See also

- [Options][OPT] - the options every action takes.
- [RQ121 CLI Inventory action][RQ121] - the requirement.

[DIA]: <part diagram.md>
[OPT]: Options.md
[RQ121]: <../development/RQ121 CLI Inventory action.md>
