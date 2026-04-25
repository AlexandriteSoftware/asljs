# components

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-components` is a catalog of reusable UI components for web applications
in the ASLJS monorepo.

This package is component-oriented: each component has a custom element name,
purpose, and usage pattern.

## Installation

```bash
npm install asljs-components
```

NPM Package: [asljs-components](https://www.npmjs.com/package/asljs-components)

## Component Contract At A Glance

- Import the package with `import 'asljs-components';` to register the custom
  element.
- The current custom element is `asljs-list`.
- The required row template is `template[data-slot="item"]`.
- Optional templates are `template[data-slot="empty"]` and
  `template[data-slot="container"]`.
- If a container template is provided, it must include `[data-role="items"]`.
- Row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,
  `count`, and `context`.

## When To Use This Package

- Use `asljs-components` when you want reusable web components already shaped
  around ASLJS binding patterns.
- Use `asljs-data-binding` directly when you only need declarative DOM binding
  without a packaged component.

## Configuration Surface

The main configuration surface for `asljs-list` is:

- `list.items`
- `list.context`
- `list.theme`
- child templates through documented data slots

Do not look for React-style render callbacks, prop-driven row renderers, or
custom callback protocols as the primary configuration model.

## Theming

The package supports structural theming through template fallback.

Resolution order:

- local `template[data-slot]` inside the component
- `list.theme`
- nearest `asljs-theme-provider`
- package default theme set with `setDefaultTheme(...)`

This keeps layout explicit and local overrides deterministic. Themes provide
defaults; they do not replace the slot-template contract.

### Default Theme

Use a package-level default when you want one app-wide baseline.

```ts
import {
    setDefaultTheme,
  } from 'asljs-components';

setDefaultTheme(
  { list:
      { container:
          '<section class="list-group" data-role="items"></section>',
        empty:
          '<div class="text-muted">No items</div>',
        item:
          `
            <a class="list-group-item list-group-item-action"
               data-bind-href="item.url"
               data-bind-text="item.title"></a>
          ` } });
```

### Theme Provider

Use `asljs-theme-provider` when you want one theme for a subtree.

```ts
import 'asljs-components';

const provider =
  document.createElement('asljs-theme-provider') as HTMLElement & {
    theme: unknown;
  };

provider.theme =
  { list:
      { container:
          '<div class="ui relaxed divided list" data-role="items"></div>',
        item:
          `
            <div class="item">
              <i class="folder icon"></i>
              <div class="content">
                <a class="header"
                   data-bind-href="item.url"
                   data-bind-text="item.title"></a>
              </div>
            </div>
          ` } };

const list =
  document.createElement('asljs-list');

list.items =
  [ { title: 'Docs', url: '/docs' } ];

provider.appendChild(list);
document.body.appendChild(provider);
```

### Per-Component Theme

Use `list.theme` when a single component should differ from the surrounding
theme.

```ts
import 'asljs-components';

const list =
  document.createElement('asljs-list') as HTMLElement & {
    items: Array<{ title: string; url: string }>;
    theme: unknown;
  };

list.theme =
  { list:
      { container:
          '<md-list data-role="items"></md-list>',
        item:
          `
            <md-list-item>
              <div slot="headline"
                   data-bind-text="item.title"></div>
            </md-list-item>
          ` } };

list.items =
  [ { title: 'Inbox', url: '/inbox' } ];
```

### Local Layout Override

If you provide local slot templates, they take precedence over the active
theme.

```ts
import 'asljs-components';

const list =
  document.createElement('asljs-list') as HTMLElement & {
    items: Array<{ title: string; url: string }>;
    theme: unknown;
  };

list.theme =
  { list:
      { item:
          '<div class="theme-row" data-bind-text="item.title"></div>' } };

list.innerHTML =
  `
    <template data-slot="item">
      <article class="custom-row">
        <a data-bind-href="item.url"
           data-bind-text="item.title"></a>
      </article>
    </template>
  `;

list.items =
  [ { title: 'Custom layout', url: '/custom' } ];
```

## Limitations

- Only documented slots are supported.
- Item rendering depends on templates, not imperative row callbacks.
- Event integration follows `asljs-data-binding` path-based handler rules.
- Container templates must contain `[data-role="items"]`.

## Components

### List

- Name: `List`
- Custom element: `asljs-list`
- Purpose: render collections from templates with row context binding.

Notes:

- Uses `template[data-slot="item"]` for row rendering.
- Supports optional `template[data-slot="empty"]` for empty state.
- Supports optional `template[data-slot="container"]` with required
  `data-role="items"` insertion point.
- Supports optional `context` object for shared row actions and state.
- Supports optional theme-provided fallback templates.

### How Row Actions Receive Row Data

- Reference shared actions through the row `context`, for example
  `data-bind-onclick="context.select"`.
- Row-specific values arrive through the derived row-local `this` context.
- That derived context includes row fields like `item` and `index`.
- Do not invent inline argument syntax like `select(item.id)`.

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

## Common Wrong Assumptions

- This is not React-style callback rendering.
- This is not template-expression syntax with inline function calls.
- Row actions should not pass arguments in attributes.
- Any container template shape is acceptable.
- Item rendering is driven by imperative callbacks instead of templates.

### List API Reference

Exports:

- `List`
- `ThemeProvider`
- `ComponentsTheme` type
- `ListThemeDefinition` type
- `ThemeTemplateValue` type
- `getDefaultTheme`
- `setDefaultTheme`
- `ListItem` type
- `ListItemsSource` type
- `ListRowContext` type

List row binding context fields:

- `item`: current row record
- `index`: zero-based row index
- `first`: `true` for the first row
- `last`: `true` for the last row
- `odd`: `true` for odd row positions
- `even`: `true` for even row positions
- `count`: total item count
- `context`: shared base context adapted to the current row

## Related Packages

- For generic DOM binding rules, see `asljs-data-binding`.
- For state reactivity, see `asljs-observable`.
- For event primitives, see `asljs-eventful`.

## Safe Authoring Rules

- Keep row templates declarative.
- Use `context` methods for shared row actions.
- Avoid custom attribute protocols.
- Do not mutate slot templates at runtime.
- Update `list.items` or the source collection instead of rewriting row DOM.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
