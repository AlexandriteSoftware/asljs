# part-presets

`part` gives a new project two definitions to start from and nothing else, so
each project writes or copies common definitions such as `Article` or `Unit Test
File` itself.

Package: `part`.

## Context

The old `part` TODO listed the presets as: basic, typescript, npm workspaces,
requirements, and .NET projects. It did not say what a preset is.

What the package offers today:

- `apps/part/artefacts` holds `Artefact Definition.md`, `Rule File.md` and their
  `parts/` files. The `files` list in `apps/part/package.json` names them one by
  one.
- `part init` copies that folder into the definitions folder
  (`apps/part/src/commands/init.ts`, [RQ124][RQ4]); it finds the folder from its
  own module path, so it works however the package is installed:

  ```ts
  const ARTEFACTS_DIRECTORY =
    path.resolve(
      MODULE_DIRECTORY,
      '../../artefacts');
  ```

- There is no configuration file; the definitions folder comes from
  `--definitions`, `PART_DEFINITIONS` or the working directory.

So the only "preset" is a one-off copy, and copies drift: EdGames'
`docs/artefacts` copies already lag behind (see
[part-multiple-artefact-folders][MAF]).

Candidate content that exists today:

- basic: `Artefact Definition` and `Rule File` (shipped), and `Article`
  (`aftefacts/`). `Article_RL3` runs the `dprint` package, a root dev dependency
  of this repository, not a dependency of `asljs-part`.
- typescript: `Unit Test File` (`aftefacts/`). Its `Location` is
  `/**/*.test.ts`, and it has no rules yet.
- npm workspaces: `ASLJS Package` and `Package README` (`aftefacts/`). Both are
  specific to this repository: the `Location` is `../{libs,apps}/*/`, and
  `Package README` checks this repository's heading set.
- requirements: `Requirement` (`aftefacts/`). Its `Location` is
  `/requirements/RQ*.md`, which matches nothing here; the `part` requirements
  live in `apps/part/development/`.
- .NET projects: nothing in this repository or in EdGames to start from.

## Problem

A preset needs three things that `part` does not have:

1. A way to use definitions shipped in the package without copying them. This is
   [part-multiple-artefact-folders][MAF]: one definitions folder per run, an
   ignored `node_modules` folder yields nothing, and a shared definition's
   relative `Location` points into the package.
2. A way to name a preset that does not depend on where npm put the package.
   `node_modules/asljs-part/...` is one layout; EdGames links ASLJS tools with
   `file:../asljs/apps/...`, and a workspace links through a symlink.
3. Definitions general enough to ship. `Location` is a list of static globs, so
   a definition cannot ask where a project keeps its requirements, or which
   folders are its npm workspaces.

## Options

### What a preset is

- **A definitions folder shipped in the package.** Each preset is a folder of
  definitions and `parts/` inside `asljs-part`, read in place as one more
  definitions folder.
  - Pros: an upgrade of `asljs-part` updates the definitions; nothing to drift;
    builds directly on multiple folders.
  - Cons: depends on [part-multiple-artefact-folders][MAF], including the
    definitions anchor; a project cannot edit a preset definition, only add its
    own beside it; rule dependencies such as `dprint` become dependencies of
    `asljs-part`.
- **An `init` scaffold.** `part init --preset <name>` copies the preset folder
  into the project, as `init` does today.
  - Pros: smallest change; the project owns and can edit the copy.
  - Cons: the copy drifts, which is what EdGames shows; an upgrade of the
    package changes nothing in the project.
- **A configuration file with `extends`.** A `part` configuration file lists
  folders and presets, in the way `dprint.json` extends a shared configuration.
  - Pros: one place for a project's set-up; replaces long command lines.
  - Cons: introduces configuration loading that `part` does not have; it still
    needs the shipped-folder model underneath, so it is a layer on the first
    option, not an alternative to it.

Recommendation: a preset is a definitions folder shipped in the package, read in
place. Keep `init` as the way to start a project's own folder, and add
`--preset` to it only if copying a preset proves useful. Leave a configuration
file until command lines become a real problem; a `package.json` script, as
EdGames plans, covers it for now.

### How a run selects a preset

- **`--preset <name>`**, repeatable, resolved from the module path as `init`
  resolves `artefacts/`.
  - Pros: independent of install layout; a typo is reported as an unknown
    preset.
  - Cons: a second option beside `--definitions`.
- **A `--definitions` value with a prefix**, such as `preset:basic`.
  - Pros: one option and one ordered list.
  - Cons: a prefix inside a path option; a folder whose name starts with the
    prefix becomes ambiguous.
- **A plain path**, such as `--definitions
  node_modules/asljs-part/presets/basic`.
  - Pros: no new syntax.
  - Cons: breaks with `file:` links and hoisting; exposes the package layout as
    an interface.

Recommendation: `--preset <name>`, read before the `--definitions` folders.

### Which presets to ship first

- **basic**: `Artefact Definition` and `Rule File` (today's `artefacts/`), plus
  `Article` once `Article_RL3` either declares `dprint` as a dependency of
  `asljs-part` or reports that it is missing.
- **typescript**: `Unit Test File`, after it has at least one rule; otherwise it
  adds an inventory entry and nothing to check.
- **requirements** and **npm workspaces**: only after `Location` can take a
  project's folder or read the workspace list. The copies in `aftefacts/` are
  written for this repository and should stay there.
- **.NET projects**: drop until a project needs it; there is nothing to base it
  on.

## Points to settle

- Folder layout: keep `apps/part/artefacts/` as the `basic` preset, or move each
  preset to `apps/part/presets/<name>/`. Moving changes `init`, the `files` list
  and the `../artefacts` links in `apps/part/development/`.
- Whether a preset can be switched off per rule, for example a project that does
  not want `Article_RL3`. With clashes reported as errors (see
  [part-multiple-artefact-folders][MAF]) this needs `--check-rules` or a new
  mechanism.
- How a preset definition reaches a project-specific folder, such as the
  requirements folder; this is a change to `Location`, not to presets.
- Whether `ASLJS Package`, `Package README` and `Requirement` in `aftefacts/`
  would then be taken from a preset in this repository too, so that the
  repository uses what it ships.

## Where

- `apps/part/artefacts/` - today's shipped definitions; the `basic` preset.
- `apps/part/package.json` - the `files` list naming shipped definitions.
- `apps/part/src/commands/init.ts` - locates the shipped folder from the module
  path.
- `apps/part/src/cli.ts` - where a `--preset` option would be added.
- `aftefacts/` - `Article`, `Unit Test File`, `Requirement`, `ASLJS Package` and
  `Package README`, the candidates listed above.
- `apps/part/development/RQ124 CLI Init action.md` - the `init` requirement.

[MAF]: part-multiple-artefact-folders.md
[RQ4]: <../apps/part/development/RQ124 CLI Init action.md>
