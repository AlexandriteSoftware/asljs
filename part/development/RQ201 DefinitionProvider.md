# RQ201 DefinitionProvider

`DefinitionProvider` is a class that looks for definitions in a given
directory.

It searches for definitions by enumerating markdown files and checking whether
their content matches [DF1 Definition][1].

The files and folders that are in .gitignore files are excluded from the search
results.

[1]: <DF1 Definition.md>
