# part

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

Markdown-defined project artefact tracing framework with a CLI for inventory,
definition inspection, and rule checks.

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
import fsp from 'node:fs/promises';

export async function validate(artefact)
{
  const dueDate =
    new Date(
      await fsp.readFile(artefact, 'utf-8')
        .then(text => text.match(/- Due date: (.*)/)[1]));

  const now = new Date();

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
| File                   | Definitions |
| ---------------------- | ----------- |
| Todo Items/Buy milk.md | Todo Item   |
```

If you want to embed PART in your own tooling instead of shelling out, import
the package-root helpers from `asljs-part` and call the report builders or
`runCli(...)` directly.

[#1]: https://github.com/AlexandriteSoftware/asljs
