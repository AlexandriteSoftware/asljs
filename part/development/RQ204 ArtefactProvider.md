# RQ204 ArtefactProvider

`ArtefactProvider` is a class that given an artefact definition provides
a list of artefacts that match the definition. E.g., given a definition of
`Rule File` it returns a list of files that are rule files.

`ArtefactProvider` is available to JS rules via the `artefacts` property of
the `context` object.

## Example: get list of artefacts

```js
const definitions =
  new DefinitionProvider(definitionsPath);

const ruleFile =
  await definitions.getDefinition('Rule File');

const artefacts =
  new ArtefactProvider(
    repositoryPath);

const ruleFiles =
  await artefacts.getArtefacts(ruleFile);
```

## Example: check whether an artefact matches a definition

```js
const definitions =
  new DefinitionProvider(definitionsPath);

const ruleFile =
  await definitions.getDefinition('Rule File');

const artefacts =
  new ArtefactProvider(
    repositoryPath);

const isRuleFile =
  await artefacts.isArtefactOfDefinition(
    'rules/Rule File_RL1.js',
    ruleFile);
```

## Example: get definitions for an artefact

```js
const definitions =
  new DefinitionProvider(definitionsPath);

const artefacts =
  new ArtefactProvider(
    repositoryPath);

const definitionsForRuleFile =
  await artefacts.getDefinitionsForArtefact(
    'rules/Rule File_RL1.js');
```
