# RQ202 Artefact Definition

Defines types of the artefacts. Provides description, location patterns,
and rules. See [Artefact Definition][1].

Artefact Definition is defined in [model/artefact-definition.ts][2] as follows:

```ts
{ path: string;
  name: string;
  description: string;
  locations: Location[];
  rules: ArtefactDefinitionRule[]; }
```

[1]: <../artefacts/Artefact Definition.md>
[2]: <../src/model/artefact-definition.ts>

## Name

The definition name is obtained from definition file name by removing the file
extension. For example, the definition name of `Unit Test.md` would be
`Unit Test`.

It also should match the top heading in the definition file.

Example, for the definition file `Unit Test.md`:

```markdown
# Unit Test

...
```

## Description

The content of the first section in the definition file forms the definition
description.

## Location

Defines there to look for artefacts. See [RQ205][RQ205].

[RQ205]: <RQ205 Definition Location.md>

## Rules

- `rules` - a list of rules that apply to the artefacts that match the
  definition. It has the following properties:
  - `id` - a unique identifier of the rule, among other rules in this
    definition, in the form of `RL<number>`.
  - `description` - a description of the rule.
