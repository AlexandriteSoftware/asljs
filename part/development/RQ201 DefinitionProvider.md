# RQ201 DefinitionProvider

`DefinitionProvider` is a class that looks for definitions in a given
directory.

It searches for definitions by enumerating markdown files and checking whether
their content matches [Artefact Definition][1].

The files and folders that are in `.gitignore` files are excluded from
search results.

`DefinitionProvider` is available to JS rules via the `definitions` property of
the `context` object.

`DefinitionProvider` caches the definitions, considering them immutable.
If the definition file is changed, recreate the `DefinitionProvider` instance to
get the updated definitions.

Example:

```js
const definitionProvider =
  new DefinitionProvider(
    logger,
    projectPath,
    definitionsPath);

const ruleFileDefinition =
  await definitionProvider.getDefinition('Rule File');
```

[1]: <../artefacts/Artefact Definition.md>
