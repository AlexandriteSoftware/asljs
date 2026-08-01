# RELEASE

Each package is released separately, from the repository root.

Use the workspace release command for publishable packages:

```pwsh
npm -w <package> run release:patch
```

Where `<package>` is the name of the package to release, e.g. `eventful` or
`observable`

## What `release:patch` does

See [common/src/commands/release-patch.ts][11] for the implementation of
the `release:patch` command.

[11]: common/src/commands/release-patch.ts
