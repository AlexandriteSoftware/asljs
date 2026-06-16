# RQ205 Definition Location

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

`Pattern` and `Exclude` has glob pattern as a parameter. The glob
pattern is either relative to the artefact definition file or absolute,
calculated from the project root. Absolute patterns starts with `/`, e.g.
`/src/**/*.js`. Folder patterns should end with `/`, e.g. `src/`.

Project root is either the current working directory or directory specified by
the `--project` CLI option.

Definition location is represented in code with the following structure:

```js
{ patterns: string[],
  exclude?: string[],
  filters?: object[] }
```

Special filters are represented as objects with at least a `name` property, e.g.
`{ name: 'GitIgnore' }`. Other properties of the filter object depend on
the filter type.

Special filters:

- `GitIgnore` - excludes files and folders defined in `.gitignore` files.

See also:

- [RQ203 GitIgnore][1]

[1]: <RQ203 GitIgnore.md>
