# RQ201 ArtefactDefinitionProvider

`ArtefactDefinitionProvider` is a class that provides access to artefact
definitions.

It searches for definitions by enumerating markdown files and checking whether
their content matches [Artefact Definition][1].

The files and folders that are in `.gitignore` files are excluded from
search results.

`ArtefactDefinitionProvider` is available to JS rules via the `definitions`
property of the `context` object.

`ArtefactDefinitionProvider` caches the definitions, considering them immutable.
If the definition file is changed, recreate the `ArtefactDefinitionProvider`
instance to get the updated definitions.

The class is defined in [artefact-definition-provider.ts][2]. It depends on
`gitIgnore` and `markdownDocumentProvider`. It is configured by
the `definitionsPath` parameter.

Example:

```js
const definitionProvider =
  new ArtefactDefinitionProvider(
    logger,
    gitIgnore,
    markdownDocumentProvider,
    definitionsPath);

const ruleFileDefinition =
  await definitionProvider.getDefinition('Rule File');
```

The provider has methods for:

- obtaining a definition by name
- getting all definitions
- loading definition from a file
- parsing a definition from a markdown document

[1]: <../artefacts/Artefact Definition.md>
[2]: <../src/providers/artefact-definition-provider.ts>
