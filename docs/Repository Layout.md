# Repository Layout

How the workspace packages are grouped, how they are addressed, and where their
output lands.

The repository is an npm workspace monorepo. Published libraries are validated
and released independently.

## Package folders

Every workspace package sits under one of two folders:

- `libs/` - the libraries a consumer installs: `components`, `dali`,
  `data-binding`, `eventful`, `logging`, `machine`, `money`, `observable` and
  `tmpdir`. None of them has a `bin`.
- `apps/` - the tools and applications: `app-builder`, `cog`, `dash`, `kb`,
  `part`, `project-tools` and `sfmt`. Each is a command or an application, and
  `dash` and `app-builder` are private to the repository.

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
- `lint`
- `lint:fix`
- `lint:md` - checks the links in the package's markdown files
- `coverage`

What `build`, `typecheck` and `test` run is in [TypeScript Configuration][TSC].

`app-builder` is a private browser app, not a publishable library. It exposes
`dev`, `test`, `typecheck`, `build` and `lint:md`. `dev` is for iterating on UI
behavior; `build` emits the demo output.

`dash` is a private Node application with no build step and no test suite yet.
It exposes `start`, `runner`, `once`, `lint`, `lint:md` and `format`. `start`
serves the page and the API on `PORT`, default 3000. `runner` is the second
process and runs the agents in `cronfile` on schedule. `once` runs every agent
immediately, which is how a newly added card gets its first sample. The SQLite
store, `apps/dash/dash.sqlite`, is created on first start and ignored by git.

## Generated output

- A workspace `build/` folder is build output, for testing and validation.
- A workspace `dist/` folder is distributable output.

`app-builder` builds into `apps/app-builder/dist/`. The deployment workflow then
force-pushes the contents of that folder to the `pages` branch root.

Neither folder is hand-edited.

[RMD]: ../README.md
[TSC]: <TypeScript Configuration.md>
