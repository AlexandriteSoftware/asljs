# How To

Commands for recurring repository tasks. The repository layout, the workspace
script shape and the generated folders are in [Repository Layout][RLY].

## Install dependencies

From the repository root:

```pwsh
npm i
```

## Validate a package

```pwsh
$env:FOLDER = 'eventful'

npm -w $env:FOLDER run test
npm -w $env:FOLDER run typecheck
npm -w $env:FOLDER run lint
npm -w $env:FOLDER run lint:md
npm -w $env:FOLDER run build
```

## Check markdown links

[remark-validate-links][RVL] reports links to missing files and headings. Each
package checks its own markdown files with `lint:md`; the root `lint:md` checks
the repository-level files: the root markdown files and `docs`, `skills`,
`tasks` and `aftefacts`.

```pwsh
npm run lint:md
npm -w asljs-eventful run lint:md
```

The plugin list is in `.remarkrc.json` and the ignored folders in
`.remarkignore`, both at the repository root, and apply to every package.

## Squash and commit changes

To squash all local commits into a single commit and push to the remote
repository:

```pwsh
$env:BRANCH = "main"  # or your target branch name
git checkout $env:BRANCH
git fetch origin
git reset --soft origin/$env:BRANCH
git commit -m "... commit message ..."
git push
```

## Check that the working folder version is the released one

```pwsh
$folder = 'sfmt'
$latestReleaseTag = `
  $(git tag --list "$("asljs-$folder")*" --sort=-version:refname | `
    Select-Object -First 1)
git diff $latestReleaseTag -- $folder > diff-$folder.tmp
```

## Get all changes in a subfolder since a tag

```pwsh
# Show all commits that changed a subfolder since a tag:
git log <tag>..HEAD -- path/to/subfolder

# Show changed files
git diff --name-status <tag>..HEAD -- path/to/subfolder

# Show the complete patch between the tag and HEAD for a subfolder
git diff <tag>..HEAD -- path/to/subfolder

# Show the complete patch between the tag and working folder for a subfolder
git diff <tag> -- path/to/subfolder

# Compact commit history
git log --oneline <tag>..HEAD -- path/to/subfolder

# Include changes from commits reachable from either side
git diff <tag>...HEAD -- path/to/subfolder
```

[RLY]: <docs/Repository Layout.md>
[RVL]: https://github.com/remarkjs/remark-validate-links
