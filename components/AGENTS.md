# ASLJS Components AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-components`.

This package currently exports the `List` web component and its related types.

## Package Scope

Exports from `src/index.ts`:

- `List`
- `ListItem`
- `ListItemsSource`
- `ListRowContext`

Current custom element:

- `asljs-list`

## Preferred Usage Patterns

### Register components once

```ts
import 'asljs-components';
```

Create and configure elements through normal DOM APIs.

### Use slot templates for rendering

Inside `asljs-list`, use:

- required: `template[data-slot="item"]`
- optional: `template[data-slot="empty"]`
- optional: `template[data-slot="container"]` with required
  `[data-role="items"]`

If `items` is non-empty and no item template is provided, the component warns
and renders nothing.

### Use row bindings through `asljs-data-binding`

Row binding context fields are:

- `item`
- `index`
- `first`
- `last`
- `odd`
- `even`
- `count`
- `context`

Prefer path-based binding expressions such as:

- `item.title`
- `index`
- `context.select`

### Use `list.context` for shared row actions and state

`List.context` is the shared base context. Row rendering derives a row-local
context that includes row-specific `item` and `index` values and binds base
context methods to that derived object.

If a handler needs row data, prefer the `context` plus `this` pattern.

## Constraints To Preserve

- Keep row rendering template-driven.
- Keep event bindings path-based; do not add parameter-expression syntax.
- Do not introduce custom invocation protocols such as `*-args` or inline call
  expressions for bindings.
- `template[data-slot="container"]` must keep `[data-role="items"]` as the
  insertion point.
- `List.items` can be a plain array or an eventful-like collection; when the
  source emits `set`, `delete`, or `define`, list rerender behavior is part of
  the current design.

## Validation

- `npm -w asljs-components run test`
- `npm -w asljs-components run typecheck`
- `npm -w asljs-components run lint`

When implementation changes affect usage, update `README.md` and this file
together.
