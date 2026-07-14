# part

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

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

Crate a data providing function in `parts/Todo Item.js`:

```js
export async function getData(artefact, context)
{
  const text =
    await context
      .markdownDocuments
      .read(
        artefact.path);

  const dueDate =
    text.match(/- Due date: (.*)/)[1];

  return { dueDate };
}
```

Create a matching rule in `parts/Todo Item_R1.js`:

```js
export async function validate(artefact, context)
{
  const artefactData =
    await context.artefactData.tryGetArtefactData(artefact);

  const dueDate =
    artefactData['Todo Item'].dueDate;

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
