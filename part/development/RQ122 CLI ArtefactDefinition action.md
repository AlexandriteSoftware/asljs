# RQ122 CLI ArtefactDefinition action

When CLI is invoked with ArtefactDefinition action, it obtains a list of all
definitions and prints them in a report with these columns:

- `Name` - name of the definition.
- `Location` - location of the definition.

When CLI is invoked with ArtefactDefinition action and a name or path of
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
      "filePath": "rules/MyDefinition_RL1.json"
    },
    {
      "id": "RL2",
      "description": "This is rule 2.",
      "filePath": "rules/MyDefinition_RL2.json"
    }
  ]
}
```
