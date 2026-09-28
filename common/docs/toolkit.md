# toolkit

## clean [path1 path2 ...]

> Removes build artefacts in the current folder.

Deletes the 'build' and 'dist' directories in the current working directory
unless arguments are provided, in which case it deletes the specified
folders and files instead. Ignores non-existent paths.

## ensure-clean-working-directory

> Fail when the repository working directory has changes.

Runs `git status` from the repository root and throws if there are uncommitted
or untracked changes. Use this before publishing or tagging a release.

## tag-release-revision

> Create an annotated git tag from the current package name and version.

Reads the current `package.json`, builds a `<name>@<version>` release
identifier, and creates the corresponding annotated git tag from the repository
root.

## release-patch

> Run the patch release workflow for the current workspace package.

Verifies the git tree is clean, runs package validation, bumps the patch
version, updates workspace dependents, publishes the package, commits release
files, tags the release, and pushes commits and tags.

## run-all [script]

> Run a workspace script across all workspaces in dependency order.

Reads the workspaces listed in the root `package.json`, builds the dependency
graph from each package `dependencies` and `devDependencies`, and runs
`npm run <script>` in every workspace, dependencies first. Defaults to the `all`
script. Independent packages run in alphabetical order. Packages without the
requested script are skipped. Throws when the workspace packages form a
dependency cycle.

## print-file <path>

> Print the contents of a file to standard output.

Reads the file at the given path, resolved against the current working
directory, and writes it to standard output without its trailing newline. Use it
to show repository notes at the end of another script.
