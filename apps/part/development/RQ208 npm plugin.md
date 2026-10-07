# RQ208 npm plugin

`asljs-part/plugins/npm` is a built-in plugin that provides the `Npm Dependency`
definition. It is loaded only when listed, e.g. `--plugin
asljs-part/plugins/npm`.

Artefacts are the entries of `dependencies`, `devDependencies`,
`peerDependencies` and `optionalDependencies` in every `package.json` under the
project root. Files under `node_modules` and paths excluded by `.gitignore`
files are skipped.

Location: `npm:<manifest>#<section>/<package>`, where `<manifest>` is the
`package.json` path relative to the project root, e.g.
`npm:apps/part/package.json#dependencies/glob`. The artefact name is the package
name.

Properties:

- `Package` - name of the package depended on.
- `Range` - version range of the dependency.
- `Kind` - the section, e.g. `devDependencies`.
- `Manifest` - the `package.json` path, relative to the project root.

## Rules

### RL1 - Workspace range

A dependency on a package of the project, a `package.json` under the project
root with that name, uses a range that the package's current version satisfies.
Supported range forms are `*`, `x.y.z`, `^x.y.z`, `~x.y.z` and `>=x.y.z`,
optionally prefixed with `workspace:`; any other form fails. Dependencies on
packages outside the project pass.
