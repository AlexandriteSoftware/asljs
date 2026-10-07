# RQ205 Definition Location

Artefact definition defines location of the artefacts in the optional `Location`
section. When a plugin provides a locator for the definition, the locator
replaces the `Location` section, see [RQ207][RQ207]. A definition with neither
has no artefacts.

The resolved files and folders become `file:` locations, see [RQ204][RQ204].

There may be multiple locations defined in the `Location` section. Each location
is defined by a `Pattern` and optional `Exclude` and special filters.

Example:

```markdown
## Location

- Pattern: `../**/*.md`
- Exclude: `../**/README.md`
- Exclude: `../**/AGENTS.md`
- GitIgnore

- Pattern: `/**/*.md`
- Exclude: `/**/README.md`
- Exclude: `/**/AGENTS.md`
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

For defining project location see [RQ132] and [RQ133].

## Shared definitions

A shared definition comes from a package source, or its document is outside the
project. A relative pattern in it resolves next to the shared document, where it
cannot match the project's files. A shared definition therefore locates its
artefacts with patterns that start with `/`, resolved from the project root, or
with a plugin locator, which can look anywhere.

When the definitions are loaded, every relative `Pattern` of a shared definition
is logged as a warning, naming the definition, its document and the pattern. The
warning is written through the logger, so it shows with `--loglevel warning` or
a lower level.

Definition location is defined in [asljs-locator location.ts][2] as follows:

```ts
{ pattern?: string,
  patterns?: string[],
  exclude?: string[],
  filters?: object[] }
```

Filters are represented as objects with at least a `name` property, e.g. `{
name: 'GitIgnore' }`. Other properties of the filter object depend on the filter
type.

Special filters:

- `GitIgnore` - excludes files and folders defined in `.gitignore` files.

See also:

- [RQ203 GitIgnore][1]

[1]: <RQ203 GitIgnore.md>
[2]: ../../../libs/locator/src/location.ts
[RQ132]: <RQ132 CLI Project parameter.md>
[RQ204]: <RQ204 ArtefactProvider.md>
[RQ207]: <RQ207 Plugin.md>
[RQ133]: <RQ133 CLI Project environment variable.md>
