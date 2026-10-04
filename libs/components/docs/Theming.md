# Theming

The components support structural theming through template fallback. Themes
provide default templates and display values; they do not replace the
slot-template contract.

## Resolution order

A component takes each template from the first of these that provides it:

1. a local `template[data-slot]` inside the component
2. the component's own theme, such as `list.theme` or `textInput.theme`
3. the nearest [`asljs-theme-provider`][THP]
4. the package default theme, set with `setDefaultTheme(...)`

This keeps layout explicit and local overrides deterministic.

## Default theme

Use a package-level default for one app-wide baseline:

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
          ` },
    textInput:
      { template:
          `
            <div class="mb-3">
              <label class="form-label"
                     data-bind-text="label"
                     data-bind-prop-hidden="hideLabel"
                     data-bind-prop-for="inputId"></label>
              <div data-role="control-host"></div>
              <div class="form-text"
                   data-bind-text="description"
                   data-bind-prop-hidden="hideDescription"
                   data-bind-prop-id="descriptionId"></div>
              <div class="invalid-feedback"
                   data-bind-text="errorMessage"
                   data-bind-prop-hidden="hideError"
                   data-bind-prop-id="errorId"></div>
            </div>
          ` } });
```

`createBootstrapTheme()` returns a ready-made Bootstrap theme, including the
[button][BTN] variant icons.

## Per-component theme

Use a component's own `theme` when one component should differ from the
surrounding theme:

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

## Local layout override

Local slot templates take precedence over the active theme:

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

## Exports

- `setDefaultTheme`, `getDefaultTheme` and `createBootstrapTheme`
- `ThemeProvider`
- `ComponentsTheme`, `ThemeTemplateValue` and the per-component theme definition
  types

[BTN]: Button.md
[THP]: <Theme Provider.md>
