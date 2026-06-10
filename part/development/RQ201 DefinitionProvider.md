# RQ201 DefinitionProvider

`DefinitionProvider` is a class that looks for definitions in a given
directory.

It searches for definitions by enumerating markdown files and checking whether
their content matches [Artefact Definition][1].

The files and folders that are in .gitignore files are excluded from the search
results.

`DefinitionProvider` is available to JS rules via the `definitions` property of
the `context` object.

[1]: <../artefacts/Artefact Definition.md>
