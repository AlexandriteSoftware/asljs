# part

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Markdown-defined project artefact tracing framework with a CLI for inventory,
definition inspection, and rule checks.

## Overview

An artefact is any unit of a project: a file, a folder, a package dependency, a
git tag. An artefact definition describes a class of artefacts: where they are,
which rules they follow, and which properties they have. Definitions are
markdown documents in a definitions folder; plugins provide the code that
implements the rules, reads properties, and finds artefacts outside the
filesystem.

## Installation

```bash
npm install --save-dev asljs-part
```

## Usage

Create a definition `artefacts/Todo Item.md`. A markdown file in the definitions
folder is a definition when its level 1 heading matches its file name.

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

Implement the property and the rule in a plugin, `artefacts/plugin.js`:

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
export default function todoPlugin()
{
  return { name: 'todo',
           data: { 'Todo Item': getData },
           rules:
             { 'Todo Item':
                 { RL1: async (artefact, context) =>
                   {
                     const { Due } =
                       await getData(artefact, context);

                     if (!Due || new Date(Due) <= new Date()) {
                       throw new Error('Due date must be in the future.');
                     }
                   } } } };
}
```

Create an artefact `Todo Items/Review Requirements.md`:

```markdown
# Review Requirements

- Due: 2030-07-01

Review the project requirements.
```

List the artefacts and check the rules:

```bash
part inventory --definitions artefacts --plugin ./artefacts/plugin.js
part check --definitions artefacts --plugin ./artefacts/plugin.js
```

```text
| Location                          | Definitions |
| --------------------------------- | ----------- |
| Todo Items/Review Requirements.md | Todo Item   |
```

`check` prints failing rules and exits with a non-zero code when any rule fails.
`--with-positives` adds passing rows, `--with-skipped` adds rules no plugin
implements.

Built-in plugins add definitions for artefacts outside the filesystem:

```bash
part inventory --plugin asljs-part/plugins/npm --plugin asljs-part/plugins/git
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
