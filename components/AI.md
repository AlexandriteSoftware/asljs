# AI

AI guidance for using `asljs-components` in generated or modified code.

## Purpose

Use this file as the AI-facing equivalent of README:

- what this package provides,
- what patterns are preferred,
- what constraints must be preserved when applying changes.

## Package Scope

Current exported component(s):

- `List` custom element (`asljs-list`)

Exports from `src/index.ts`:

- `List`
- `ListItem`
- `ListItemsSource`
- `ListRowContext`

## Preferred Usage Patterns

### 1. Register components once

```ts
import 'asljs-components';
```

Create and configure elements through standard DOM APIs.

### 2. Provide templates through data slots

Use `template[data-slot]` children inside `asljs-list`:

- required for non-empty rendering:
  - `template[data-slot="item"]`
- optional:
  - `template[data-slot="empty"]`
  - `template[data-slot="container"]` (must include `[data-role="items"]`)

If `items` is non-empty and `item` slot is missing, component warns and renders
nothing.

### 3. Use row bindings via `asljs-data-binding`

Supported row binding context fields:

- `item`
- `index`
- `first`
- `last`
- `odd`
- `even`
- `count`
- `context`

Prefer path-based binding expressions:

- values: `item.title`, `index`, `context.label`
- events: `context.select`, `item.onClick`

### 4. Use `list.context` for shared row actions/state

`List.context` is a shared base context value. During row rendering, the list
creates a row-local derived context and exposes it at `context` in bindings.

For object contexts:

- derived row context carries row-specific `item` and `index`,
- own function members from base context are bound to the derived row context,
- methods like `context.select` can use `this.item` safely.

Example:

```ts
import 'asljs-components';

const list = document.createElement('asljs-list');

list.context = {
  select(this: { item: { id: string; title: string } }, event: Event) {
    event.preventDefault();
    console.log(this.item.id, this.item.title);
  }
};

list.innerHTML = `
  <template data-slot="item">
    <button data-bind-text="item.title"
            data-bind-onclick="context.select"></button>
  </template>
`;

list.items = [
  { id: 'a', title: 'First' },
  { id: 'b', title: 'Second' }
];
```

## Event Binding Constraints

When producing AI-generated code that uses `asljs-data-binding` event bindings,
preserve this contract:

- `data-bind-on*` resolves a function from a path and registers it as listener.
- Do not add parameter-expression syntax.
- Do not introduce `*-args`, `*-param`, or function-call binding expressions.

If row-specific data is required by handlers, use `context` + `this` pattern.

## Observable Items Pattern

`List.items` can be plain array or observable/eventful-like collection.
When an eventful-like source emits `set`, `delete`, or `define`, list requests
rerender.

AI should:

- keep collection updates deterministic,
- avoid mutating template structure at runtime,
- prefer updating `items`/collection state over imperative DOM rewrites.

## Do And Do-Not Checklist

Do:

- keep templates declarative,
- keep event bindings path-based,
- keep container slot compliant with `[data-role="items"]`.

Do not:

- bypass `template[data-slot="item"]` for row rendering,
- rely on implicit global handlers,
- add custom invocation protocol for bindings.

## Maintenance Task Reference

When implementation changes in `components/src/` affect usage, update:

- README for developer-facing docs,
- this file (`components/AI.md`) for AI-facing usage guidance.
