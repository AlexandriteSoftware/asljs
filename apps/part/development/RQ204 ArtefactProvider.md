# RQ204 ArtefactProvider

`ArtefactProvider` is a class that given an artefact definition provides a list
of artefacts that match the definition. E.g., given a definition of `Article` it
returns the markdown files that are articles.

An artefact is `{ location, name, definitions }`:

- `location` - a URI string with a scheme. `file:` locations hold the path
  relative to the project root, e.g. `file:docs/Article.md`; plugins provide
  other schemes, e.g. `git:tag/v1.0.0`.
- `name` - for `file:` artefacts, the file name without extension.
- `definitions` - names of all definitions the artefact matches.

Artefacts of a definition come from its plugin locator when a plugin provides
one, otherwise from its `Location` section, see [RQ205][RQ205]. The provider
locates the artefacts of every definition once and caches the result.

Methods taking a location accept a value without a scheme as a file path,
absolute or relative to the project root.

`ArtefactProvider` is available to JS rules via the `artefacts` property of the
`context` object. The path of a `file:` artefact is
`context.files.path(artefact)`.

## Example: get list of artefacts

```js
const article =
  await context.definitions.getDefinition('Article');

const articles =
  await context.artefacts.getArtefacts([ article ]);
```

## Example: check whether an artefact matches a definition

```js
const isArticle =
  await context.artefacts.isArtefactOfDefinition(
    'docs/Article.md',
    article);
```

## Example: get definitions for an artefact

```js
const definitionsForArticle =
  await context.artefacts.getDefinitionsForArtefact(
    'file:docs/Article.md');
```

[RQ205]: <RQ205 Definition Location.md>
