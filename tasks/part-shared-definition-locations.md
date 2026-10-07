# part-shared-definition-locations

A definition shared from another folder or package locates its artefacts
relative to its own document, so it cannot describe artefacts of the project
that uses it; and an md-only folder inside a git-ignored path yields no
definitions.

Package: `part`, and `locator` if an anchor is added.

## Context

`part` 0.3.0 takes several definition sources: repeated `--definitions`,
`PART_DEFINITIONS` entries separated by newlines or `|`, md-only folders, plugin
libraries, plugin files and packages such as `asljs-part`, each with an optional
`;<include>;<exclude>` name filter ([RQ111][RQ1]). Definition names are unique
across sources; a clash is an error. Rule implementations and data functions
come from plugins and bind by definition name, so the old `parts/` lookup
problems are gone.

What remains:

- A `Location` pattern is resolved against the folder of its definition
  document, unless it starts with `/`, which anchors it at the project root
  ([RQ205][RQ5]). A definition shipped in `asljs-part` or read from another
  folder therefore matches files next to itself, not in the consumer's project.
  The shipped `Artefact Definition` has no `Location` at all, so it has no
  artefacts.
- An md-only folder is filtered through `.gitignore`. `part definitions
  --definitions node_modules/asljs-part/artefacts`, run from this repository's
  root, prints an empty table. Packages are reached by name instead
  (`--definitions asljs-part`), which covers the plugin case, but not an md-only
  folder of a package.
- `aftefacts/Artefact Definition.md` is a copy of `apps/part/artefacts/Artefact
  Definition.md`. Loading both sources fails: `--definitions aftefacts
  --definitions asljs-part` reports `Definition "Artefact Definition" is
  provided by plugin "asljs-part" and by plugin "asljs-artefacts"`. A filter
  such as `asljs-part;;Artefact Definition` works around it.

## Options

### Locating artefacts for a shared definition

- **A definitions anchor in `Location`.** A pattern with a reserved prefix is
  resolved against each definition source folder of the run, as `/` is resolved
  against the project root.
  - Pros: explicit; relative and `/` patterns keep their meaning.
  - Cons: a change to `asljs-locator`, whose resolver takes one base path per
    call; new `Location` syntax to document in [RQ205][RQ5].
- **A plugin locator.** A shared plugin provides a locator for its definition
  and decides where to look, e.g. from the project root.
  - Pros: works today; no new syntax.
  - Cons: code for what is a static pattern in a document.
- **Anchor shared definitions at the project root** with `/` patterns.
  - Pros: no code change.
  - Cons: the package cannot know where a consumer keeps its files.

Recommendation: a definitions anchor, once a shipped definition needs to match
files in the consumer's definition folders.

### Ignored folders

- Read a folder named explicitly in `--definitions` even when git ignores it,
  still filtering what lies inside it through `.gitignore`.

### The duplicated `Artefact Definition`

- Delete `aftefacts/Artefact Definition.md` and point the root `AGENTS.md` link
  at `apps/part/artefacts/Artefact Definition.md`; load it with `--definitions
  "asljs-part;Artefact Definition"` where it is needed.

## Points to settle

- The anchor syntax. It must not collide with a glob or with the `/` anchor.
- Whether shipped md-only folders are needed at all, now that a package exposes
  its definitions as a plugin.

## Where

- `apps/part/src/providers/definition-source-provider.ts` - source loading.
- `apps/part/src/providers/markdown-definition-reader.ts` - folder scan and
  `.gitignore` filter.
- `apps/part/src/providers/artefact-provider.ts` - resolves `Location` against
  `path.dirname(definition.path)`.
- `libs/locator/src/location.ts` - pattern anchoring, if the anchor is added.
- `apps/part/development/RQ205 Definition Location.md` - the requirement.
- `aftefacts/Artefact Definition.md` - the copy.

[RQ1]: <../apps/part/development/RQ111 CLI Definitions parameter.md>
[RQ5]: <../apps/part/development/RQ205 Definition Location.md>
