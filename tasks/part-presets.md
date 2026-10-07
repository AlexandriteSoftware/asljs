# part-presets

`asljs-part` ships three definitions, so each project still writes or copies
common definitions such as `Article` or `Unit Test File` itself.

Package: `part`.

## Context

What a preset is has been settled by the plugin model of `part` 0.3.0: the
package root's default export is a plugin that provides every definition
documented in `apps/part/artefacts/` ([RQ210][R210]). A project reads it in
place with `--definitions asljs-part` and picks definitions with a filter, e.g.
`--definitions "asljs-part;NPM *,GIT *"` ([RQ111][R111]). An upgrade of the
package updates the definitions, so nothing drifts, and `part init`, which
copied definitions, is gone.

Shipped today: `Artefact Definition`, `Git Tag` and `NPM Dependency`.

Candidates in `aftefacts/` (the private `asljs-artefacts` package):

- `Article` - `RL1` heading, `RL2` links, `RL3` dprint formatting. `RL3` runs
  the `dprint` package, a dependency of `asljs-artefacts`, not of `asljs-part`.
  `RL1` reports 41 files in this repository, so its rule may be too strict to
  ship as is.
- `Unit Test File` - `Location` `/**/*.test.ts`, no rules.
- `ASLJS Package`, `Package README` and `Requirement` - specific to this
  repository: `../{libs,apps}/*/`, this repository's README heading set, and
  `/requirements/RQ*.md`, which matches nothing here.

## Problem

1. Shipping a definition means shipping its implementation in `asljs-part` and
   the implementation's dependencies, e.g. `dprint` for `Article` `RL3`.
2. A shared definition cannot locate a project's files except from the project
   root, see [part-shared-definition-locations][SDL]. `Requirement` and the
   npm-workspace definitions need the project's folder or workspace list.
3. A definition filter takes or drops whole definitions; a project cannot switch
   off one rule, e.g. `Article` `RL3`, except with `--check-rules`.

## Options

### Which definitions to ship next

- **`Article`**, once `RL3` either declares `dprint` as a dependency of
  `asljs-part` or reports that it is missing, and `RL1` agrees with what
  projects accept as a heading.
- **`Unit Test File`**, after it has at least one rule; otherwise it adds an
  inventory entry and nothing to check.
- **`Requirement` and npm workspaces** only after a definition can locate a
  project's folders. `NPM Dependency` already reads the workspace's
  `package.json` files through its plugin locator.

### Turning off a rule

- A rule filter in the source syntax, e.g. a fourth `;` part with rule names.
- Leave it to `--check-rules` and the cache.

## Points to settle

- Whether `asljs-part` should take on `dprint` as a runtime dependency.
- Whether this repository then reads `Article` from `asljs-part`, so that it
  uses what it ships.

## Where

- `apps/part/artefacts/` - the shipped definition documents.
- `apps/part/src/plugins/part.ts` - the package plugin.
- `aftefacts/` - `Article`, `Unit Test File`, `Requirement`, `ASLJS Package` and
  `Package README`, with their implementations in `aftefacts/src/`.

[R111]: <../apps/part/development/RQ111 CLI Definitions parameter.md>
[R210]: <../apps/part/development/RQ210 Package plugin.md>
[SDL]: part-shared-definition-locations.md
