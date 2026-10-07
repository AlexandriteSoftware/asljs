# Git Tag

A tag in the git repository at the project root.

A built-in definition of `asljs-part`: the package locates its artefacts and
implements its rules. Load it alone with `--definitions "asljs-part;Git Tag"`.

Artefacts are the tags listed by `git tag --list`. Outside a git repository, or
when git is not available, there are no artefacts. The location is
`git:tag/<name>`, e.g. `git:tag/v1.0.0`; the artefact name is the tag name.

## Properties

### Commit

- Type: String

Commit the tag points to.

### Annotated

- Type: Boolean

Whether the tag is an annotated tag object.

### Date

- Type: DateTime?

Tagger date of an annotated tag, or the commit date otherwise.

## Rules

### RL1 - Reachable

The tag points to a commit reachable from `HEAD`.
