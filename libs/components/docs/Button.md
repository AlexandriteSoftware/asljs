# Button

`asljs-button` is a reusable icon-plus-text button.

## Properties

- `icon` — the icon markup, as an HTML string
- `text` — the visible label
- `variant` — selects theme-provided defaults, such as `add`, `delete` or
  `settings`; also settable as the `variant` attribute
- `buttonClassName` — a class for the inner native button, for host CSS
- `type` — `button`, `submit` or `reset`
- `disabled`

`asljs-button` is the only button element: variants are configured through
`variant` and theme data rather than separate custom elements.

## Usage

```ts
import 'asljs-components';

const button =
  document.createElement('asljs-button') as HTMLElement & {
    variant: string;
    icon: string;
    text: string;
    disabled: boolean;
    type: 'button' | 'submit' | 'reset';
  };

button.variant = 'add';
button.type = 'button';
button.disabled = false;
```

## Variants

The package default theme provides built-in variants:

- `variant="add"` -> `U+F26E` and `Add`
- `variant="delete"` -> `U+F5DE` and `Delete`
- `variant="settings"` -> `U+F3E5` and `Settings`

Display defaults are resolved in this order: explicit `icon`, `text` and
`buttonClassName`, then the selected `button.variants.<name>` theme entry, then
the base `button` theme, then the package default theme. Explicit values always
win.

## Bootstrap icons

Bootstrap-style icon markup comes from theme configuration rather than being
hard-coded into the component:

```ts
import {
    createBootstrapTheme,
    setDefaultTheme,
  } from 'asljs-components';

setDefaultTheme(
  createBootstrapTheme());
```

`createBootstrapTheme()` supplies Bootstrap icon markup and labels for the
`add`, `delete` and `settings` variants. See [Theming][THM].

[THM]: Theming.md
