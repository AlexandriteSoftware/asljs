# Theme Provider

`asljs-theme-provider` (`ThemeProvider`) provides theme defaults to its
descendant components.

It is a lightweight provider element built directly on `HTMLElement`. Set its
`theme` property; descendant components listen for theme changes and resolve
their local overrides before the provider's defaults or the package defaults.

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

How a provider's theme combines with the others is in [Theming][THM].

[THM]: <Theming.md>
