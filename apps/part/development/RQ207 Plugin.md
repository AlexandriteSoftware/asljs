# RQ207 Plugin

A plugin is a JavaScript module whose default export is a factory function. The
factory receives a context and returns a plugin object. Plugins are the runtime
of artefact definitions: they provide definitions, locations, data and rule
implementations in code.

The types are defined in [plugin.ts][1] and exported from the package root.

```js
/** @type { import('asljs-part').PluginFactory } */
export default function plugin(context)
{
  return { name: 'example',
           definitions: async () => [ ],
           locate: { 'Git Tag': async () => [ ] },
           data: { 'Todo Item': async (artefact, context) => ({ }) },
           rules: { 'Todo Item': { RL1: async (artefact, context) => { } } } };
}
```

[1]: ../src/plugin.ts

## Context

The factory is called once, when the plugin is loaded, with:

- `logger`
- `projectPath` - absolute path of the project root
- `definitionsPath` - absolute path of the definitions directory
- `markdownDocuments` - the `MarkdownDocumentProvider`
- `files` - `files.path(artefact)` gives the absolute path of a `file:` artefact

## Members

Every member except `name` is optional.

- `name` - unique among loaded plugins; used as the `source` of the definitions
  the plugin provides.
- `definitions` - returns definitions in code: `name`, `description`, and
  optional `rules` (`id`, optional `heading`, `content`) and `properties`. Rule
  ids follow the format of [RQ202][RQ202].
- `locate` - by definition name, a function returning the artefacts of the
  definition as `{ location, name }`. It replaces the definition's `Location`
  section, see [RQ205][RQ205].
- `data` - by definition name, the data function giving the artefact's
  properties.
- `rules` - by definition name, then rule id, the rule implementation. It
  completes when the artefact satisfies the rule and throws otherwise; the error
  message is the failure message.

## Failures

Every one of these stops the command with an error:

- the module cannot be loaded, has no default export function, its factory
  throws, or returns no object with a `name`;
- two plugins have the same name;
- two plugins bind a locator, a data function, or the same rule of the same
  definition;
- a binding names a definition that does not exist, or a rule id that the
  definition does not have;
- a plugin definition has the name of another definition, see [RQ201][RQ201].

A data function that throws is logged, and the artefact has no data for the
definition.

[RQ201]: <RQ201 ArtefactDefinitionProvider.md>
[RQ202]: <RQ202 Artefact Definition.md>
[RQ205]: <RQ205 Definition Location.md>
