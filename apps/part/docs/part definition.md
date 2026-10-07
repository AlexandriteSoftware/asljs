# part definition

Prints one definition in full: its source, description, locations, properties
and rules, and for each rule whether a plugin implements it.

```text
part definition <target>
```

`<target>` is the name of a loaded definition or the path of a definition
document.

```bash
part definition --definitions asljs-part "NPM Package"
```

## See also

- [Options][OPT] - the options every action takes.
- [RQ126 CLI Definition action][RQ126] - the requirement.
- [Artefact Definition][AD] - the definition format.

[AD]: <../artefacts/Artefact Definition.md>
[OPT]: Options.md
[RQ126]: <../development/RQ126 CLI Definition action.md>
