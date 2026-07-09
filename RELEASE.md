# RELEASE

Each package is released separately, from the repository root.

Use the workspace release command for publishable packages:

```pwsh
npm -w eventful run release:patch
```

`app-builder` is not released with this flow.

Release prerequisites:

- typecheck passes (`npm -w <folder> run typecheck`)
- lint passes (`npm -w <folder> run lint`)
- tests pass (`npm -w <folder> run test`)
- repository working folder is clean (`git status`)

The `release:patch` command runs those prerequisites automatically before it
publishes.

## What `release:patch` does

For the selected publishable package, `release:patch`:

1. verifies the repository working folder is clean
2. runs `typecheck`, `lint`, and `test`
3. runs `clean` and `build`
4. bumps the package patch version without creating a git tag yet
5. updates dependency ranges in every sibling workspace package that depends on
   the released package
6. updates `app-builder/package.json` when `app-builder` depends on the
   released package
7. refreshes `package-lock.json`
8. publishes the package
9. commits the version and dependency updates
10. creates the release tag from the committed package version
11. pushes the commit
12. pushes the created release tag

## Example: eventful is changed

Run the package-local release script from the repository root.

```pwsh
npm -w eventful run release:patch
npm -w observable run release:patch
npm -w machine run release:patch
npm -w money run release:patch
npm -w data-binding run release:patch
npm -w dali run release:patch
npm -w components run release:patch
npm -w part run release:patch
```
