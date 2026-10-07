# part

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Markdown-defined project artefact tracing framework with a CLI for inventory,
definition inspection, and rule checks.

## Overview

An artefact is any unit of a project: a file, a folder, a package dependency, a
git tag. An artefact definition describes a class of artefacts: where they are,
which rules they follow, and which properties they have. Definitions are
markdown documents; plugins provide the code that implements the rules, reads
properties, and finds artefacts outside the filesystem. Rules without code can
be checked by an AI agent, and results are cached between runs.

## Installation

```bash
npm install --save-dev asljs-part
```

## Usage

Create a definition `artefacts/Todo Item.md`. In a folder of definitions, a
markdown file is a definition when its level 1 heading matches its file name.

```markdown
# Todo Item

A task that needs to be done.

## Location

- Pattern: `../Todo Items/*.md`

## Properties

### Due

- Type: Date

When it needs to be done.

## Rules

### RL1

Due date must be in the future.
```

Create an artefact `Todo Items/Review Requirements.md`:

```markdown
# Review Requirements

- Due: 2030-07-01

Review the project requirements.
```

List the artefacts, and check the rules with an AI agent:

```bash
part inventory --definitions artefacts
part check --definitions artefacts --ai
```

```text
| Location                          | Definitions |
| --------------------------------- | ----------- |
| Todo Items/Review Requirements.md | Todo Item   |
```

`--ai` uses Claude; `--ai=copilot` uses Copilot. Without `--ai`, rules with no
code are reported as `Skip` when `--with-skipped` is given.

To check rules with code, make the folder a plugin library: add
`artefacts/package.json` with `{ "type": "module", "main": "plugin.js" }` and
`artefacts/plugin.js`:

```js
import { readFile }
  from 'node:fs/promises';

async function getData(artefact, context)
{
  const text =
    await readFile(
      context.files.path(artefact),
      'utf8');

  return { Due: text.match(/- Due: (.*)/)?.[1] ?? null };
}

/** @type { import('asljs-part').PluginFactory } */
export default async function todoPlugin(context)
{
  const definitions =
    await context.readDefinitions();

  return { name: 'todo',
           version: '1',
           definitions: async () => definitions,
           data: { 'Todo Item': getData },
           rules:
             { 'Todo Item':
                 { RL1: async (artefact, ruleContext) =>
                   {
                     const { Due } =
                       await getData(artefact, ruleContext);

                     if (!Due || new Date(Due) <= new Date()) {
                       throw new Error('Due date must be in the future.');
                     }
                   } } } };
}
```

`part check --definitions artefacts` now runs RL1 as code. `check` prints
failing rules and exits with a non-zero code when any rule fails.
`--with-positives` adds passing rows.

Results are cached in `.part/check-cache.json`: a rule runs again only when the
file changed after its last check, the rule text changed, or the plugin
`version` changed. `--force-check` runs everything.

Built-in plugins add definitions for artefacts outside the filesystem:

```bash
part inventory --definitions asljs-part/plugins/npm --definitions asljs-part/plugins/git
```

- `asljs-part/plugins/npm` - `Npm Dependency`, one artefact per dependency in
  every `package.json`.
- `asljs-part/plugins/git` - `Git Tag`, one artefact per tag.

Other output formats: `part inventory --format=json`, `--format=diagram` (an
SVG), and `--with-properties` to add property columns.

## Further reading

- [Artefact Definition][AD] - the definition format.
- [Requirements][RQ] - the behavior of the CLI, the providers, and the plugin
  contract.

## License

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
[AD]: <artefacts/Artefact Definition.md>
[RQ]: development
