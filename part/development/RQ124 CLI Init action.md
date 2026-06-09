# RQ124 CLI Init action

When CLI is invoked with Init action, it initializes the artifact definitions
directory by copying into it bootstrap files from [artefacts][1]:

- `Artefact Definition.md` - defines the format of the definition files.
- `Rule File.md` - defines the format of the rule files.
- `rules` - a directory for rule files.

When [`definitions` parameter][2] is specified, the CLI initializes
the specified directory. If not specified, the CLI initializes the current
working directory.

[1]: <../artefacts>
[2]: <RQ111 CLI Definitions.md>
