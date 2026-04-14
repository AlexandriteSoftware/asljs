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

```ts
import 'asljs-components';

const list =
  document.createElement('asljs-list');

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
         data-bind-text="item.title"></a>
    </div>
  </template>
`;

list.items =
  [ { title: 'First', url: '/first' },
    { title: 'Second', url: '/second' } ];
```

### List API Reference

Exports:

- `List`
- `ListItem` type
- `ListItemsSource` type
- `ListRowContext` type

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
