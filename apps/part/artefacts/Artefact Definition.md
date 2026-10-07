# Artefact Definition

> The `Artefact Definition` document is self-describing, i.e., it defines an
> artefact definition and is an artefact definition itself.

An artefact is a project construction element, such as a file, folder, or any
other unit within a project. It represents a tangible component of the project
structure.

An artefact has a description, content, and location. The description provides
information about the artefact’s purpose and content. The content is the data
contained within the artefact’s boundary, and the location specifies where the
artefact is situated within the project.

There are thousands of different artefacts in any non-trivial project. Examples:

- project vision document
- architecture decision record
- README file
- release notes
- deployed service
- staging environment database
- external package reference

Artefact Definition defines a class of artefacts. Artefacts within the class
share common characteristics, such as description and structure.

Differences in structure within the same class of artefacts are captured by the
properties defined in the Artefact Definition.

Location uniquely identifies where the artefact is situated within the project
structure.

Artefact definition and location uniquely identify artefacts within a project.
E.g., the file `2026.1 Release Notes.md` is both a `Release Notes File` and a
`Markdown File`, where `Release Notes File` and `Markdown File` are the artefact
definitions.

Location property structure is not fixed and can vary depending on the artefact
definition. It can be (but is not limited to):

- file path for the artefact within the project filesystem
- URL for the artefact if it is hosted remotely
- database connection string, table, and primary key for the artefact within the
  database

Artefact definition document is a markdown file that describes an artefact
description, optionally defines location pattern, rules, and properties.

Artefact definition documents are one source of artefact definitions. The
application, inspecting projects and locating artefacts, can use other sources
of artefact definitions as well. E.g., plugins, that inject artefact definitions
programmatically.

- `# <FileName>` - the name of the definition, should match the name of the
  markdown file (without extension).
- `# <FileName>` is followed by a description of the definition.
- `## Location` - optional, specifies where the artefacts are located. When not
  specified, a plugin may provide the locations; otherwise the definition has no
  artefacts.
- `## Rules` - optional, specifies rules that apply to the definition. Each rule
  is a `### <RuleId>` section, optionally followed by ` - <title>`, e.g. `###
  RL1 - Due date`. The section body is the rule description. A rule id is
  uppercase letters followed by digits, e.g. `RL1`, unique within the
  definition.
- `## Properties` - optional, specifies artefact's properties, as returned by
  the data function a plugin provides for the definition.

A markdown file in the definitions directory is a definition when its level 1
heading matches its file name. No other section is required, so the definitions
directory should hold only definitions.

Definition names are unique: a definition provided by a plugin cannot have the
name of a definition document.

## Artefacts Location

Artefact definition supports one type of location specification: filesystem.
Other location types are provided by plugins. A plugin locator for a definition
replaces its `Location` section.

A location is a URI string with a scheme, e.g. `file:docs/Article.md`,
`npm:package.json#dependencies/glob` or `git:tag/v1.0.0`. A `file:` location is
the path relative to the project root, and it is printed without the scheme.

Filesystem artefact location is defined in the `Location` section of the
artefact definition document.

Example:

```markdown
## Location

- Pattern: `../**/*.md`
- Exclude: `../**/README.md`
- GitIgnore
```

There are three types of the location instructions:

- `Pattern` - includes files or folders matching the glob pattern.
- `Exclude` - excludes files or folders from the location matching. It is
  optional and can be used multiple times.
- Special filters, e.g. `GitIgnore` - defines location in a special way.

`Pattern` and `Exclude` have a glob pattern as a parameter. The glob pattern is
either relative to the artefact definition file or absolute, calculated from the
project root. Absolute patterns start with `/`, e.g. `/src/**/*.js`. Folder
patterns should end with `/`, e.g. `src/`.

Project root is either the current working directory or directory specified by
the `--project` CLI option.

Definition location is represented in code with the following structure:

```js
{ pattern?: string,
  patterns?: string[],
  exclude?: string[],
  filters?: object[] }
```

Special filters are represented as objects with at least a `name` property, e.g.
`{ name: 'GitIgnore' }`. Other properties of the filter object depend on the
filter type.

Special filters:

- `GitIgnore` - excludes files and folders defined in `.gitignore` files. It
  collects `.gitignore` files starting from the file's folder and going up to
  the project root until it reaches the repository root (folder with the `.git`
  subfolder) or filesystem root. It caches collected `.gitignore` files.

## Artefact Rules

Artefact rules define the constraints and validations that apply to the
artefact's properties and structure. Each rule has an id and a description.

Code-enforced rules have their function provided by a plugin, bound to the
definition name and the rule id.

When a rule is not code-enforced, it serves as a documentation of the constraint
and may be validated manually or by other means, e.g. through AI agents. `part
check` reports such a rule as `Skip`.

## Artefact Properties

Property is defined as

```markdown
### <PropertyName>

- Type: <PropertyType>

<Description>
```

Property type can be one of the following:

- `String` - a string value.
- `Number` - a number value.
- `Boolean` - a boolean value.
- `Date` - a date value (timezone is not specified).
- `DateTime` - a date and time value (timezone is not specified).
- `Timestamp` - a date and time value in UTC.
- `Object` - a JSON-serialisable object with properties.
- `Artefact` - a reference to another artefact: its location, e.g.
  `git:tag/v1.0.0`, or, from a file artefact, a path relative to the current
  artefact.

If property type ends with `[]`, e.g. `String[]`, it means that the property is
an array of values. If it ends with `?`, e.g. `Date?` or `String[]?`, the
property may have no value.

Example:

For the Article artefact (representing markdown article), the RelatedArticles
property is of type `Artefact[]`, meaning that it is an array of paths to other
articles within this project.
