# RQ126 CLI Definition action

When CLI is invoked with Definition action and a name or path of
a definition, it reads the definition and prints serialised content as markdown
list, with properties rendered as `- property name: property value`, nested
objects rendered as nested lists, and arrays rendered as lists of lists.

Example:

```json
{
  "name": "MyDefinition",
  "description": "This is a sample definition.",
  "properties": {
    "property1": "value1",
    "property2": "value2"
  },
  "rules": [
    {
      "id": "RL1",
      "description": "This is rule 1.",
      "filePath": "parts/MyDefinition_RL1.json"
    },
    {
      "id": "RL2",
      "description": "This is rule 2.",
      "filePath": "parts/MyDefinition_RL2.json"
    }
  ]
}
```
