# toolkit

## clean [path1 path2 ...]

> Removes build artefacts in the current folder.

Deletes the 'build' and 'dist' directories in the current working directory
unless arguments are provided, in which case it deletes the specified
folders and files instead. Ignores non-existent paths.

## build-local-deps

> Build local workspace dependencies for the current package.

Resolves workspace-local package dependencies recursively from package.json
dependency fields and runs `npm run build` for each dependency in dependency
order.

## ensure-clean-working-directory

> Fail when the repository working directory has changes.

Runs git status from the repository root and throws if there are uncommitted or
untracked changes. Use this before publishing or tagging a release.

## tag-release-revision

> Create an annotated git tag from the current package name and version.

Reads the current package.json, builds a `<name>@<version>` release identifier,
and creates the corresponding annotated git tag from the repository root.

## release-patch

> Run the patch release workflow for the current workspace package.

Verifies the git tree is clean, runs package validation, bumps the patch
version, updates workspace dependents, publishes the package, commits release
files, tags the release, and pushes commits and tags.
