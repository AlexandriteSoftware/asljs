# RQ202 Artefact Definition

Defines types of the artefacts. Provides description, location patterns, rules
and properties. A definition comes from a definition document or from a plugin,
see [RQ207][RQ207]. See [Artefact Definition][1].

Artefact Definition is defined in [model/artefact-definition.ts][2] as follows:

```ts
{ path?: string;
  source: string;
  name: string;
  description: string;
  locations: Location[];
  rules: ArtefactDefinitionRule[];
  properties: ArtefactDefinitionProperty[] }
```

[1]: <../artefacts/Artefact Definition.md>
[2]: ../src/model/artefact-definition.ts
[RQ207]: <RQ207 Plugin.md>

`path` is the definition document path; plugin definitions have none. `source`
is `markdown` for definition documents, or the name of the plugin.

## Name

The definition name is obtained from definition file name by removing the file
extension. For example, the definition name of `Unit Test.md` would be `Unit
Test`.

A markdown file is a definition when its top heading matches the definition
name. No other section is required.

Example, for the definition file `Unit Test.md`:

```markdown
# Unit Test

...
```

## Description

The content of the first section in the definition file forms the definition
description.

## Location

Optional. Defines where to look for artefacts. A definition without `Location`
and without a plugin locator has no artefacts. See [RQ205][RQ205].

[RQ205]: <RQ205 Definition Location.md>

## Rules

Optional. Each rule is a `### <id> [- <title>]` section under `## Rules`; the
section is the rule description. Rules apply to the artefacts that match the
definition. A rule has the following properties:

- `id` - a unique identifier of the rule, among other rules in this definition:
  uppercase letters followed by digits, e.g. `RL1`. A section whose heading does
  not start with an id is ignored with a warning.
- `name` - `<definition name>_<id>`.
- `heading` - the section heading.
- `content` - the rule description.

A rule is implemented by a plugin, see [RQ207][RQ207]; otherwise it documents a
constraint and `check` reports it as `Skip`.

## Properties

Optional. Each property is a `### <name>` section under `## Properties` with a
`- Type: <type>` item. A type ending with `[]` is a list; a type ending with `?`
is nullable, e.g. `String[]?`.
