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

## fint [glob...] [--exclude glob]...

> Format and lint the repository's markdown and JSON files.

Formats each selected markdown file with dprint and then lints it with remark,
so the linter sees what dprint left rather than what the author typed. Formats
each selected JSON file with dprint. Ignores every other file, so a glob may
name a directory without picking up its sources.

Candidates come from `asljs-locator`, rooted at the current working directory
and filtered through `GitIgnore`, so `.gitignore` decides what belongs to the
repository. With no glob every candidate is selected, so `--exclude` alone
means "everything but these". A glob that names a directory matches everything
beneath it, and one with wildcards is matched as written.

Formats with the `dprint.json` nearest to the working directory, looking there
and then upwards, so a package with its own configuration uses it and every
other package uses the root one. remark finds its own nearest `.remarkrc*` the
same way. Expects `dprint` and `remark` on `PATH`, which an npm script
provides.

The file list reaches dprint through a `.toolkit-dprint.json` written in the
working directory for the run and removed again afterwards, which extends the
configuration found above and names each file. That keeps the command short and
lifts the limit on how many files one run can take. remark has no configuration
key for its files, so it is the one command that carries them as arguments and
is split into several runs to stay within the command line limit; its log
records the count rather than the paths.

Fails when remark reports a warning, because it runs with `--frail`.

## remove-local-modules

> Remove the node_modules directory of every workspace package.

Reads the workspaces listed in the root `package.json` and removes the
`node_modules` directory inside each one, reporting how many of them existed.
A package without one is not an error.

The root `node_modules` is left alone, because it holds the hoisted install
every package resolves through; removing that is a reinstall rather than this
command. Discovering the packages rather than listing them is what keeps the
set complete when a package is added.
