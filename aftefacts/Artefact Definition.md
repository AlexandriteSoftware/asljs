# Artefact Definition

Artefact Definition is a markdown file, with the following content:

- `# <FileName>` - the name of the definition, should match the name of the
  markdown file (without extension).
- `# <FileName>` is followed by a description of the definition.
- `## Location` - required, specifies where the definition is located in the
  project.
- `## Rules` - optional, specifies rules that apply to the definition. Has a
  list of rules, each with an id and description. First token in the rule
  description should be the rule id. Rule ids has the format
  `<letters><number>`.
- `## Properties` - optional, specifies artefact's properties, as returned by
  the artefact's data provider.

## Location

- Pattern: `**/*.md`
- GitIgnore

## Rules

### RL1 - Rule File

Each rule in the definition file should have a corresponding rule file that
implements it. The rule file should be named
`<DefinitionName>_<RuleId>.<extension>`, for example, `Todo Item_R1.js`.

## Artefacts Location

Artefact definition defines location of the artefacts in the `Location` section.

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

`Pattern` and `Exclude` has glob pattern as a parameter. The glob pattern is
either relative to the artefact definition file or absolute, calculated from the
project root. Absolute patterns starts with `/`, e.g. `/src/**/*.js`. Folder
patterns should end with `/`, e.g. `src/`.

Project root is either the current working directory or directory specified by
the `--project` CLI option.

Definition location is represented in code with the following structure:

```js
{ patterns: string[],
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
- `Object` - an object with properties.
- `Artefact` - a path to the artefact, relative to location of the current
  artefact.

If property type ends with `[]`, e.g. `String[]`, it means that the property is
an array of values.

Example:

For the Article artefact (representing markdown article), the RelatedArticles
property is of type `Artefact[]`, meaning that it is an array of paths to other
articles within this project.
