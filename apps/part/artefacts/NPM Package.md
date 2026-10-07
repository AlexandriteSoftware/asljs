# NPM Package

A `package.json` file of the project.

A built-in definition of `asljs-part`: the package locates its artefacts and
provides their data. Load it alone with `--definitions "asljs-part;NPM
Package"`.

Artefacts are the `package.json` files under the project root. Files under
`node_modules` and paths excluded by `.gitignore` files are skipped. The
location is the file, e.g. `file:apps/part/package.json`; the artefact name is
the package `name`, or the file path relative to the project root when the
package has no name.

## Properties

### Name

- Type: String?

The package `name`.

### Version

- Type: String?

The package `version`.

### Private

- Type: Boolean

Whether the package sets `private` to `true`.

### Dependencies

- Type: Artefact[]

The packages of the project in `dependencies`: for each entry, the first
`package.json` under the project root, in path order, with that name. Entries on
packages outside the project are left out.

### DevDependencies

- Type: Artefact[]

The packages of the project in `devDependencies`, found as for `Dependencies`.

### Workspaces

- Type: Artefact[]

The `package.json` of each folder matched by the `workspaces` globs, an array or
the `packages` array of an object, relative to this package's folder; a pattern
starting with `!` excludes. In path order.
