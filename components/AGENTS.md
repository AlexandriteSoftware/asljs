# ASLJS Components AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-components`.

This package currently exports the `List` web component, package theming
helpers, a theme provider custom element, and related types.

## Package Scope

Exports from `src/index.ts`:

- `List`
- `ThemeProvider`
- `ComponentsTheme`
- `ListThemeDefinition`
- `ThemeTemplateValue`
- `getDefaultTheme`
- `setDefaultTheme`
- `ListItem`
- `ListItemsSource`
- `ListRowContext`

Current custom element:

- `asljs-list`
- `asljs-theme-provider`

## AI Quick Reference

Component contract at a glance:

- import with `import 'asljs-components';`
- current custom element: `asljs-list`
- theme provider element: `asljs-theme-provider`
- required row template: `template[data-slot="item"]`
- optional templates: `template[data-slot="empty"]` and
  `template[data-slot="container"]`
- theme fallback order: local slot template -> `list.theme` -> nearest
  `asljs-theme-provider` -> package default theme
- container templates must include `[data-role="items"]`
- row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,
  `count`, and `context`

Use this package when:

- you want reusable web components already designed for ASLJS patterns
- you specifically want `asljs-list` rather than raw DOM binding

Use another package when:

- you only need DOM binding -> `asljs-data-binding`
- you need state reactivity -> `asljs-observable`
- you need event primitives -> `asljs-eventful`

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

### Use themes as template defaults

Themes provide fallback templates. They do not replace slot-template authoring.

Preferred resolution order:

- local `template[data-slot]`
- `list.theme`
- nearest `asljs-theme-provider`
- `setDefaultTheme(...)`

If a local slot template exists, it must continue to win over the active theme.

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

## How Row Actions Receive Row Data

- handlers should usually be referenced as `context.someAction`
- row-specific values arrive through the derived row-local `this` context
- the derived row context includes at least `item` and `index`
- do not invent inline argument syntax like `select(item.id)`

## Common Wrong Assumptions

- this is React-style callback rendering
- this is template-expression syntax with inline function calls
- row actions should pass arguments in attributes
- any container template shape is acceptable
- item rendering is driven by imperative callbacks instead of templates

## Constraints To Preserve

- Keep row rendering template-driven.
- Keep theme behavior template-driven and slot-compatible.
- Keep event bindings path-based; do not add parameter-expression syntax.
- Do not introduce custom invocation protocols such as `*-args` or inline call
  expressions for bindings.
- `template[data-slot="container"]` must keep `[data-role="items"]` as the
  insertion point.
- `List.items` can be a plain array or an eventful-like collection; when the
  source emits `set`, `delete`, or `define`, list rerender behavior is part of
  the current design.

## Safe Authoring Rules

- keep row templates declarative
- use themes only as fallback template sources
- use `context` methods for shared row actions
- avoid custom attribute protocols
- do not mutate slot templates at runtime
- update `list.items` or the source collection instead of rewriting row DOM

## Change Safety Checklist

- If touching row rendering, then preserve template-driven rendering.
- If touching theming, then preserve fallback precedence and local-template
  override behavior.
- If touching container handling, then preserve `[data-role="items"]` as the
  insertion point.
- If touching row context, then preserve the documented field names.
- If touching event binding integration, then preserve path-based
  `asljs-data-binding` handler rules.
- If touching item sources, then preserve rerender behavior for arrays and
  eventful-like collections.

## Validation

- `npm -w asljs-components run test`
- `npm -w asljs-components run typecheck`
- `npm -w asljs-components run lint`

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update `README.md` separately only when
user-facing usage or behavior changes.
