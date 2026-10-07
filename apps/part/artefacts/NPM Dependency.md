# NPM Dependency

A package dependency declared in a `package.json` file of the project.

A built-in definition of `asljs-part`: the package locates its artefacts and
implements its rules. Load it alone with `--definitions "asljs-part;NPM
Dependency"`.

Artefacts are the entries of `dependencies`, `devDependencies`,
`peerDependencies` and `optionalDependencies` in every `package.json` under the
project root. Files under `node_modules` and paths excluded by `.gitignore`
files are skipped. The location is `npm:<manifest>#<section>/<package>`, where
`<manifest>` is the `package.json` path relative to the project root, e.g.
`npm:apps/part/package.json#dependencies/glob`; the artefact name is the package
name.

## Properties

### Package

- Type: String

Name of the package depended on.

### Range

- Type: String

Version range of the dependency.

### Kind

- Type: String

Section of the dependency, e.g. `devDependencies`.

### Manifest

- Type: String

Path of the `package.json` file, relative to the project root.

## Rules

### RL1 - Workspace range

A dependency on a package of the project, a `package.json` under the project
root with that name, uses a range that the package's current version satisfies.
Supported range forms are `*`, `x.y.z`, `^x.y.z`, `~x.y.z` and `>=x.y.z`,
optionally prefixed with `workspace:`; any other form fails. Dependencies on
packages outside the project pass.
