# Repository Layout

How the workspace packages are grouped, how they are addressed, and where their
output lands.

The repository is an npm workspace monorepo. Published libraries are validated
and released independently.

## Package folders

Every workspace package sits under one of two folders:

- `libs/` - the libraries a consumer installs: `components`, `dali`,
  `data-binding`, `eventful`, `locator`, `logging`, `machine`, `money`,
  `observable` and `tmpdir`. None of them has a `bin`.
- `apps/` - the tools and applications: `app-builder`, `cog`, `dash`, `kb`,
  `part`, `toolkit` and `sfmt`. Each is a command or an application, and `dash`
  and `app-builder` are private to the repository.

The folder is a grouping, not a boundary: a package is still addressed by its
workspace name, so every `npm -w asljs-<name>` command is the same wherever the
package lives.

[README.md][RMD] carries the package list with a line of description each.

## Workspace scripts

Every script runs from the repository root, addressed by workspace name:

```pwsh
npm -w <workspace-name> run <script>
```

Publishable library packages expose a common script shape:

- `clean`
- `build`
- `build:test`
- `test`
- `test:watch`
- `typecheck`
- `flint` - formats the package's files and lints them with eslint and remark;
  `npm -w <workspace-name> run flint -- --fix` lets eslint fix what it can
- `coverage`

What `build`, `typecheck` and `test` run is in [TypeScript Configuration][TSC].

`app-builder` is private, not a publishable library. It exposes `dev`, `test`,
`typecheck`, `build` and `flint`. `build` generates the static site from the
repository's markdown files, starting at the root `README.md`; `dev` runs the
App Builder demo, whose sources the package still holds but does not publish.

`dash` is a private Node application with no build step and no test suite yet.
Its sources are in `src/`, served and run as written. It exposes `start`,
`runner`, `once` and `flint`. `start` serves the page and the API on `PORT`,
default 3000. `runner` is the second process and runs the agents in `cronfile`
on schedule. `once` runs every agent immediately, which is how a newly added
card gets its first sample. The SQLite store, `apps/dash/dash.sqlite`, is
created on first start and ignored by git.

## Generated output

- A workspace `build/` folder is build output, for testing and validation.
- A workspace `dist/` folder is distributable output.

`app-builder` builds the site into `apps/app-builder/dist/`. The deployment
workflow then force-pushes the contents of that folder to the `pages` branch
root.

Neither folder is hand-edited.

[RMD]: ../README.md
[TSC]: <TypeScript Configuration.md>
