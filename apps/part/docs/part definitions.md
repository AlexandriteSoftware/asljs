# part definitions

Lists the loaded definitions: their name, their source, and the path of their
document.

```text
part definitions
```

```bash
part definitions --definitions artefacts --definitions asljs-part
```

```text
| Name      | Source     | Location               |
| --------- | ---------- | ---------------------- |
| Article   | asljs-part |                        |
| Todo Item | markdown   | artefacts/Todo Item.md |
```

The source is `markdown` for a definition document in an md-only folder, or the
name of the plugin that provides the definition. The location is the document
path relative to the project root, and empty for a plugin definition.

To see one definition in full, use [part definition][DEF].

## See also

- [Options][OPT] - the options every action takes.
- [RQ122 CLI Definitions action][RQ122] - the requirement.

[DEF]: <part definition.md>
[OPT]: Options.md
[RQ122]: <../development/RQ122 CLI Definitions action.md>
