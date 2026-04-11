# components

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-components` contains reusable UI components for web applications in the
ASLJS monorepo.

Initial release includes:

- `List` (`<asljs-list>`) component.

## Installation

```bash
npm install asljs-components
```

NPM Package: [asljs-components](https://www.npmjs.com/package/asljs-components)

## Usage

```ts
import 'asljs-components';

const list =
  document.createElement('asljs-list');

list.innerHTML = `
  <template data-slot="item">
    <div data-bind-text="item.title"></div>
  </template>
`;

list.items =
  [ { title: 'First' },
    { title: 'Second' } ];
```

## API Reference

Exports:

- `List`
- `ListItem` type
- `ListItemsSource` type
- `ListRowContext` type

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
