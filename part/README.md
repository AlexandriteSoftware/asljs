# part

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

Markdown-defined project artefact tracing framework with a CLI for inventory,
definition inspection, and rule checks.

## Public API At A Glance

- CLI command: `part`
- Package name: `asljs-part`
- Package-root exports: `runCli`, `Definition`, `DefinitionProvider`,
  `GitIgnore`, `buildInventoryReport`, `buildArtefactDefinitionReport`,
  `buildCheckReport`, and `generateInventoryTable`

## Core Concepts

- A definition is a markdown file whose level 1 heading matches the file name.
- Each definition describes where artefacts live via a `Location` section.
- `Location` paths are resolved relative to the definition file.
- Optional `Properties` entries map markdown list labels into rule inputs.
- `Rules` entries resolve to JavaScript or executable rule files and are run by
  the `check` command.
- The same artefact can match more than one definition; PART keeps all matching
  definitions visible in inventory and check results.

## CLI

- `part inventory` scans the current folder and reports artefacts, matching
  definitions, and aggregate rule state.
- `part artefactdefinition` lists discovered definitions or prints a specific
  definition in detail.
- `part check` runs rules for matching artefacts, returns a non-zero exit code
  on any failure, and shows only failures by default.
- `part check --with-positives` includes passing `OK` rows in the output.
- `part init` bootstraps a definitions directory with `Artefact Definition.md`,
  `Rule File.md`, and a `rules/` folder.
- `part update-rules` creates or refreshes JavaScript rule files for discovered
  definitions.
- `part version` prints the package version from `package.json`.

## Quick Start

Create a definition such as `Todo Item.md`:

```markdown
# Todo Item

A task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Files: ../Todo Items/*.md

## Rules

- R1 - Due date must be in the future.
```

Create a matching rule in `rules/Todo Item_R1.js`:

```js
export function validate(todoItem)
{
  const now = new Date();
  const dueDate = new Date(todoItem.dueDate);

  if (dueDate <= now) {
    throw new Error('Due date must be in the future.');
  }
}
```

Create an artefact in `Todo Items/Buy milk.md`:

```markdown
# Buy milk

- Due date: 2026-07-01

Buy milk on the way home.
```

Run inventory:

```bash
part inventory
```

Bootstrap a definitions folder:

```bash
part init --definitions artefacts
```

Example output:

```text
| File                   | Definitions | Rules |
| ---------------------- | ----------- | ----- |
| Todo Items/Buy milk.md | Todo Item   | Ok    |
```

If you want to embed PART in your own tooling instead of shelling out, import
the package-root helpers from `asljs-part` and call the report builders or
`runCli(...)` directly.

[#1]: https://github.com/AlexandriteSoftware/asljs
