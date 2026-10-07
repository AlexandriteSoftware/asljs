# RQ209 git plugin

`asljs-part/plugins/git` is a built-in plugin that provides the `Git Tag`
definition. It is loaded only when listed, e.g. `--definitions
asljs-part/plugins/git`.

Artefacts are the tags of the git repository at the project root, listed with
`git tag --list`. Outside a git repository, or when git is not available, there
are no artefacts.

Location: `git:tag/<name>`, e.g. `git:tag/v1.0.0`. The artefact name is the tag
name.

Properties:

- `Commit` - the commit the tag points to.
- `Annotated` - whether the tag is an annotated tag object.
- `Date` - tagger date of an annotated tag, or the commit date otherwise.

## Rules

### RL1 - Reachable

The tag points to a commit reachable from `HEAD`.
