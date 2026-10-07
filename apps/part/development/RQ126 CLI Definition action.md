# RQ126 CLI Definition action

When CLI is invoked with Definition action and a name or path of a definition,
it reads the definition and prints serialised content as markdown list, with
properties rendered as `- property name: property value`, nested objects
rendered as nested lists, and arrays rendered as lists of lists.

The output includes the definition `source` (see [RQ122][RQ122]) and, for each
rule, whether a plugin implements it. `path` is present for definition documents
only.

Example:

```json
{
  "name": "MyDefinition",
  "source": "markdown",
  "description": "This is a sample definition.",
  "location": [ ],
  "rules": [
    {
      "id": "RL1",
      "implemented": true,
      "description": "This is rule 1."
    },
    {
      "id": "RL2",
      "implemented": false,
      "description": "This is rule 2."
    }
  ],
  "properties": [ ],
  "path": "artefacts/MyDefinition.md"
}
```

[RQ122]: <RQ122 CLI Definitions action.md>
