# RQ201 ArtefactDefinitionProvider

`ArtefactDefinitionProvider` is a class that provides access to artefact
definitions.

It searches for definitions by enumerating markdown files in the definitions
directory. A markdown file is a definition when its level 1 heading matches its
file name, see [Artefact Definition][1].

It adds the definitions that loaded plugins provide, see [RQ207][RQ207]. A
definition name is unique: when a plugin provides a definition with the name of
another definition, the provider throws. After collecting the definitions, it
validates plugin bindings and throws on a binding to an unknown definition or
rule id.

The files and folders that are in `.gitignore` files are excluded from search
results.

`ArtefactDefinitionProvider` is available to JS rules via the `definitions`
property of the `context` object.

`ArtefactDefinitionProvider` caches the definitions, considering them immutable.
If the definition file is changed, recreate the `ArtefactDefinitionProvider`
instance to get the updated definitions.

The class is defined in [artefact-definition-provider.ts][2]. It depends on
`gitIgnore`, `markdownDocumentProvider` and `pluginProvider`. It is configured
by the `definitionsPath` parameter.

Example:

```js
const definitionProvider =
  new ArtefactDefinitionProvider(
    logger,
    gitIgnore,
    markdownDocumentProvider,
    pluginProvider,
    definitionsPath);

const articleDefinition =
  await definitionProvider.getDefinition('Article');
```

The provider has methods for:

- obtaining a definition by name
- getting all definitions
- loading definition from a file
- parsing a definition from a markdown document

[1]: <../artefacts/Artefact Definition.md>
[2]: ../src/providers/artefact-definition-provider.ts
[RQ207]: <RQ207 Plugin.md>
