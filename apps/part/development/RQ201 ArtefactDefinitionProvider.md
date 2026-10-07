# RQ201 ArtefactDefinitionProvider

`ArtefactDefinitionProvider` is a class that provides access to artefact
definitions.

It returns the definitions of all definition sources, see [RQ111][RQ111]. In an
md-only source, a markdown file is a definition when its level 1 heading matches
its file name, see [Artefact Definition][1]; every `*.md` file of the folder is
read, without `.gitignore` filtering. Plugins provide their definitions in code,
see [RQ207][RQ207].

A definition name is unique across sources: a clash throws. After collecting the
definitions, the sources validate plugin bindings and throw on a binding to an
unknown definition or rule id.

`ArtefactDefinitionProvider` is available to JS rules via the `definitions`
property of the `context` object.

`ArtefactDefinitionProvider` caches the definitions, considering them immutable.
If the definition file is changed, recreate the `ArtefactDefinitionProvider`
instance to get the updated definitions.

The class is defined in [artefact-definition-provider.ts][2]. It depends on
`markdownDefinitionReader`, which parses definition documents, and
`definitionSourceProvider`, which loads the sources.

Example:

```js
const definitionProvider =
  new ArtefactDefinitionProvider(
    logger,
    markdownDefinitionReader,
    definitionSourceProvider);

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
[RQ111]: <RQ111 CLI Definitions parameter.md>
[RQ207]: <RQ207 Plugin.md>
