# release

Use when: releasing a package to npm.

Each package is released independently, from the repository root.

Use the workspace release command for publishable packages:

```pwsh
npm -w <package> run release:patch
```

Where `<package>` is the name of the package to release, e.g. `eventful` or
`observable`

## What `release:patch` does

See [release-patch.ts][11] for the implementation of the `release:patch`
command.

[11]: ../apps/project-tools/src/commands/release-patch.ts
