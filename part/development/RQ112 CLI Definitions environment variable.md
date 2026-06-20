# RQ112 CLI Definitions environment variable

CLI tool searches for definitions by enumerating markdown files in the current
working directory and checking whether the content of the file matches
[Artefact Definition][1].

When environment variable `PART_DEFINITIONS` is set, the CLI uses the path
specified in the environment variable to look for definitions.

CLI parameter `--definitions` has higher priority than the environment variable.

[1]: <../artefacts/Artefact Definition.md>
