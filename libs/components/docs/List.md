# List

`asljs-list` renders a collection from templates, binding each row to its own
context.

## Properties

- `items` — a plain array, or an eventful-like collection the list re-renders
  from when it changes
- `context` — shared row actions and state
- `theme`
- local slot templates

## Templates

- `template[data-slot="item"]` — required; renders each row
- `template[data-slot="empty"]` — optional; the empty state
- `template[data-slot="container"]` — optional; must contain a
  `[data-role="items"]` insertion point

If `items` is non-empty and no item template is provided, the component warns
and renders nothing. Themes can supply fallback templates; local templates
always win. See [Theming][THM].

## Row binding context

Each row is bound with `asljs-data-binding` to a row context with these fields:

- `item`: the current row record
- `index`: the zero-based row index
- `first`: `true` for the first row
- `last`: `true` for the last row
- `odd`: `true` for odd row positions
- `even`: `true` for even row positions
- `count`: the total item count
- `context`: the shared base context, adapted to the current row

## Row actions

- Reference shared actions through the row context, for example
  `data-bind-onclick="context.select"`.
- Row-specific values arrive through the derived row-local `this`, which
  includes row fields such as `item` and `index`.
- Arguments are not written in attributes: `select(item.id)` is not a binding.

```ts
import 'asljs-components';

const list =
  document.createElement('asljs-list');

list.context = {
  select(this: { item: { id: string; title: string } }, event: Event) {
    event.preventDefault();
    console.log('selected', this.item.id, this.item.title);
  }
};

list.innerHTML = `
  <template data-slot="container">
    <section class="rows" data-role="items"></section>
  </template>

  <template data-slot="empty">
    <div>No items</div>
  </template>

  <template data-slot="item">
    <div>
      <a data-bind-href="item.url"
         data-bind-text="item.title"
         data-bind-onclick="context.select"></a>
      <small data-bind-text="index"></small>
    </div>
  </template>
`;

list.items =
  [ { title: 'First', url: '/first' },
    { title: 'Second', url: '/second' } ];
```

## Authoring rules

Rendering is template-driven. That shapes how a list is written:

- Rows come from templates, not from React-style render callbacks or
  prop-driven row renderers.
- Bindings are `asljs-data-binding` paths, not template expressions with inline
  function calls, and event handlers follow its path-based rules.
- Only the documented slots are used, and a container template must keep its
  `[data-role="items"]` insertion point.
- Keep row templates declarative, and use `context` methods for shared row
  actions rather than custom attribute protocols.
- Do not mutate slot templates at runtime. Update `list.items`, or the source
  collection, instead of rewriting row DOM.

## Exports

- `List`
- `ListItem`, `ListItemsSource` and `ListRowContext` types
- `ListThemeDefinition` type, with the theming exports listed in
  [Theming][THM]

[THM]: <Theming.md>
