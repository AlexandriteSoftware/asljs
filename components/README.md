# components

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-components` is a catalog of reusable UI components for web applications
in the ASLJS monorepo.

This package is component-oriented, but not every component has the same form.
The current package includes:

- shared base classes such as `AssistedInput`
- custom elements such as `asljs-button`
- custom elements such as `asljs-properties`
- custom elements such as `asljs-keyboard`
- custom elements such as `asljs-letterpad`
- custom elements such as `asljs-numpad`
- custom elements such as `asljs-list`
- custom elements such as `asljs-file`
- custom elements such as `asljs-ai-chat`
- custom elements such as `asljs-text-input`
- provider elements such as `asljs-theme-provider`

## Installation

```bash
npm install asljs-components
```

NPM Package: [asljs-components](https://www.npmjs.com/package/asljs-components)

## Component Contract At A Glance

- Import the package with `import 'asljs-components';` when you need the
  package custom elements registered.
- The current custom elements are `asljs-ai-chat`, `asljs-button`,
  `asljs-file`, `asljs-keyboard`, `asljs-letterpad`, `asljs-list`,
  `asljs-numpad`, `asljs-properties`, `asljs-text-input`, and
  `asljs-theme-provider`.
- AI chat state is exposed directly on the `asljs-ai-chat` custom element
  (`messages`, `promptDraft`, and related state fields).
- `AssistedInput` is the shared Lit base for the assisted on-screen input
  components.
- Button rendering is driven by explicit `icon` and `text` properties.
- Runtime model metadata is exposed through exported `*ModelDefinition` values.
- `asljs-properties` renders a generated property editor from a model
  definition plus a target object.
- File rendering is driven by a provider plus ordered file handlers.
- Keyboard rendering is driven by a fixed QWERTY layout, a `characters`
  filter, and bubbling `key` and `submit` events.
- Letterpad rendering is driven by a fixed alphabetic keypad layout, a
  `characters` filter, a `collapsed` toggle, and bubbling `key` and `submit`
  events.
- Numpad rendering is driven by a fixed keypad layout plus a `characters`
  filter and bubbling `key` events.
- Text input editing is driven by explicit properties plus emitted `input` and
  `change` events.
- The required row template is `template[data-slot="item"]`.
- Optional templates are `template[data-slot="empty"]` and
  `template[data-slot="container"]`.
- If a container template is provided, it must include `[data-role="items"]`.
- If a text-input template is provided, it must include
  `[data-role="control-host"]`.
- Optional text-input control templates are `template[data-slot="input"]` and
  `template[data-slot="textarea"]`.
- If a text-input control template is provided, it must include the matching
  native `input` or `textarea` element.
- Row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,
  `count`, and `context`.

## When To Use This Package

- Use `asljs-components` when you want reusable web components already shaped
  around ASLJS binding patterns.
- Use `asljs-components` when you want a packaged UI surface plus its state or
  theming contract through a documented custom element API.
- Use `asljs-data-binding` directly when you only need declarative DOM binding
  without a packaged component.

## Buttons

The button components are:

- `asljs-button` for a reusable icon-plus-text button

Button variants are configured through `button.variant` and theme data rather
than separate custom elements. The package default theme provides built-in
`add`, `delete`, and `settings` variant defaults.

### Button Example

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

Built-in package defaults are:

- `variant="add"` -> `U+F26E` and `Add`
- `variant="delete"` -> `U+F5DE` and `Delete`
- `variant="settings"` -> `U+F3E5` and `Settings`

Explicit `icon`, `text`, and `buttonClassName` values still override the
theme-provided variant defaults.

Bootstrap-style icon markup should come from theme configuration rather than
being hard-coded into the component.

```ts
import {
    createBootstrapTheme,
    setDefaultTheme,
  } from 'asljs-components';

setDefaultTheme(
  createBootstrapTheme());
```

`createBootstrapTheme()` currently supplies Bootstrap icon markup and labels
for the `add`, `delete`, and `settings` button variants.

## Runtime Model Definitions

The package exports runtime model-definition values such as
`TextInputModelDefinition` and `ButtonModelDefinition`.

Each property definition includes:

- `name`
- `type`
- optional `title`
- optional `description`
- optional `editable`

These definitions can be used directly or passed to `asljs-properties` to
render a generated editor.

```ts
import {
    TextInputModelDefinition,
  } from 'asljs-components';

console.log(
  TextInputModelDefinition.properties);
```

## Properties Editor

`asljs-properties` renders a form for editable properties in a model
definition.

- string and number properties use `asljs-text-input`
- boolean properties use `asljs-select` with `Yes` / `No`
- object, array, function, and read-only values are shown as read-only fields

```ts
import 'asljs-components';
import {
    ButtonModelDefinition,
  } from 'asljs-components';

const button =
  document.createElement('asljs-button');
const properties =
  document.createElement('asljs-properties') as HTMLElement & {
    definition: unknown;
    target: object | null;
  };

properties.definition = ButtonModelDefinition;
properties.target = button;
```

## Assisted Input Base

`AssistedInput` is the shared Lit base class for the package's on-screen input
surfaces.

It owns the common assisted-input contract:

- `characters` filtering
- host accessibility defaults with `role="group"`
- bubbling `key` dispatch with `{ key: string }`
- bubbling `submit` dispatch for Enter
- pointer-down suppression to keep focus on the target field

`asljs-keyboard`, `asljs-letterpad`, and `asljs-numpad` extend this base and
provide only their layout-specific rendering and special interaction rules.

## Numpad

`asljs-numpad` is a visual keypad for numeric and operator entry.

The main configuration surface is:

- `numpad.characters`

The component always allows `Backspace` and `Enter`. When `characters` is a
non-empty string, single-character keys are enabled only if that string
contains the key.

The component emits a bubbling `key` event whose detail is shaped as:

```ts
{ key: string }
```

### Numpad Example

```ts
import 'asljs-components';

const numpad =
  document.createElement('asljs-numpad') as HTMLElement & {
    characters: string;
  };

numpad.characters = '0123456789.';

numpad.addEventListener(
  'key',
  event => {
    const detail =
      (event as CustomEvent<{ key: string }>).detail;

    console.log(detail.key);
  });
```

## Keyboard

`asljs-keyboard` is a visual full-keyboard surface for mixed text entry.

The main configuration surface is:

- `keyboard.characters`

The component always allows `Backspace` and `Enter`. When `characters` is a
non-empty string, single-character keys are enabled only if that string
contains the key. This includes digits, punctuation, and a literal space.

The component emits bubbling `key` and `submit` events. The `key` detail is
shaped as:

```ts
{ key: string }
```

### Keyboard Example

```ts
import 'asljs-components';

const keyboard =
  document.createElement('asljs-keyboard') as HTMLElement & {
    characters: string;
  };

keyboard.characters = "abcdefghijklmnopqrstuvwxyz0123456789 .,'-";

keyboard.addEventListener(
  'key',
  event => {
    const detail =
      (event as CustomEvent<{ key: string }>).detail;

    console.log(JSON.stringify(detail.key));
  });

keyboard.addEventListener(
  'submit',
  () => {
    console.log('submit');
  });
```

## Letterpad

`asljs-letterpad` is a visual keypad for alphabetic entry.

The main configuration surface is:

- `letterpad.characters`
- `letterpad.collapsed`

The component always allows `Backspace` and `Enter`. When `characters` is a
non-empty string, single-character keys are enabled only if that string
contains the key.

The keyboard toggle button flips `collapsed` and updates its own accessible
label between `Show letterpad` and `Hide letterpad`.

The component emits bubbling `key` and `submit` events. The `key` detail is
shaped as:

```ts
{ key: string }
```

### Letterpad Example

```ts
import 'asljs-components';

const letterpad =
  document.createElement('asljs-letterpad') as HTMLElement & {
    characters: string;
    collapsed: boolean;
  };

letterpad.characters = 'trace';
letterpad.collapsed = false;

letterpad.addEventListener(
  'key',
  event => {
    const detail =
      (event as CustomEvent<{ key: string }>).detail;

    console.log(detail.key);
  });

letterpad.addEventListener(
  'submit',
  () => {
    console.log('submit');
  });
```

For the broader ASLJS component model, see
`docs/development/UI Components.md` in the repository root.

## Configuration Surface

The main configuration surface for `asljs-file` is:

- `fileView.provider`
- `fileView.handlers`
- `fileView.fileName`

`provider.loadFile(fileName)` returns normalized file data. The component asks
handlers in order whether they can display the file and uses the first match.

The package provides these handler factories:

- `createPdfFileHandler()`
- `createImageFileHandler()`
- `createTextFileHandler()`
- `createTextEditorFileHandler()`

If no handler matches, the component shows fallback "Preview unavailable"
content and an Open link when blob or data-url content is available.

### File Component Example

```ts
import 'asljs-components';
import {
    createImageFileHandler,
    createPdfFileHandler,
    createTextFileHandler,
  } from 'asljs-components';

const fileView =
  document.createElement('asljs-file') as HTMLElement & {
    provider: {
      loadFile: (fileName: string) => Promise<unknown>;
    } | null;
    handlers: unknown[];
    fileName: string | null;
  };

fileView.provider =
  { loadFile: async (fileName: string) => {
      if (fileName === 'invoice.pdf') {
        return {
          name: 'invoice.pdf',
          blob: new Blob([ 'pdf' ], { type: 'application/pdf' }),
        };
      }

      return {
        name: fileName,
        text: 'No content',
      };
    } };

fileView.handlers =
  [ createPdfFileHandler(),
    createImageFileHandler(),
    createTextFileHandler() ];

fileView.fileName = 'invoice.pdf';
```

The main configuration surface for `asljs-list` is:

- `list.items`
- `list.context`
- `list.theme`
- child templates through documented data slots

Do not look for React-style render callbacks, prop-driven row renderers, or
custom callback protocols as the primary configuration model.

The main configuration surface for `asljs-text-input` is:

- `textInput.value`
- `textInput.label`
- `textInput.description`
- `textInput.placeholder`
- `textInput.validator`
- `textInput.multiline`
- `textInput.enterKeyBehavior`
- `textInput.autoExtend`
- `textInput.autoExtendMaxRows`
- `textInput.theme`
- local `template[data-slot="template"]`
- local `template[data-slot="input"]`
- local `template[data-slot="textarea"]`

`value` is a set/reset input, not the live mutable draft state. User edits are
kept in `draftValue`, reflected in the observable `status` object, and emitted
through component `input` and `change` events.

### Text Input Example

```ts
import 'asljs-components';

const textInput =
  document.createElement('asljs-text-input') as HTMLElement & {
    label: string | null;
    description: string | null;
    value: string | null;
    placeholder: string | null;
    validator: ((value: string) => string | null) | null;
    multiline: boolean;
    enterKeyBehavior: 'finish' | 'newline';
    autoExtend: boolean;
    autoExtendMaxRows: number | null;
    status: {
      watch: (property: string, listener: (value: unknown) => void) => () => boolean;
    };
  };

textInput.label = 'Summary';
textInput.description = 'Ctrl+Enter always finishes editing.';
textInput.placeholder = 'Write a short summary';
textInput.multiline = true;
textInput.enterKeyBehavior = 'newline';
textInput.autoExtend = true;
textInput.autoExtendMaxRows = 8;
textInput.validator =
  value => value.trim() === ''
    ? 'Summary is required.'
    : null;
textInput.value = 'Initial text';

textInput.addEventListener(
  'change',
  event => {
    const detail =
      (event as CustomEvent<{
        value: string;
        isValid: boolean;
      }>).detail;

    console.log(detail.value, detail.isValid);
  });
```

### Text Input Template Override

Provide a local `template[data-slot="template"]` when the layout must differ
from the Bootstrap-oriented default. The template can use any supported
`asljs-data-binding` attributes, but it must include `[data-role="control-host"]`
so the component can mount the actual `input` or `textarea`.

```html
<asljs-text-input>
  <template data-slot="template">
    <div class="editor-field">
      <div data-role="control-host"></div>
      <small data-bind-text="description"
             data-bind-prop-hidden="hideDescription"></small>
      <div class="error"
           data-bind-text="errorMessage"
           data-bind-prop-hidden="hideError"></div>
    </div>
  </template>
</asljs-text-input>
```

Provide `template[data-slot="input"]` or `template[data-slot="textarea"]`
when the native control markup itself must come from the local component or
theme. The slot must include the matching native control element, but wrapper
markup around that control is allowed. Control templates can also use
`asljs-data-binding` attributes, for example to place validation feedback next
to the real control.

```html
<asljs-text-input>
  <template data-slot="input">
    <div class="field-shell">
      <input class="field-control"
             data-control-invalid-class="field-control-invalid">
    </div>
  </template>
</asljs-text-input>
```

## Theming

The package supports structural theming through template fallback.

Resolution order:

- local `template[data-slot]` inside the component
- per-component theme such as `list.theme` or `textInput.theme`
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

### Theme Provider Usage

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

### AI Chat

- API: `AiChat`
- Custom element: `asljs-ai-chat`
- Purpose: build a chat UI around explicit custom-element state with optional
  persistence and tool execution hooks.

Notes:

- The custom element owns chat state directly through properties such as
  `messages`, `promptDraft`, and related fields.
- `messages` is a store object that provides methods for saving messages and
  reading the messages list.
- The custom element accepts explicit `options` for request and persistence
  integration.
- If `options.stateStore` is not provided, the component uses sessionStorage by
  default so refresh keeps chat history.
- Persisted state includes the last OpenAI response id to reconnect the chat
  response flow after refresh when possible.

### File

- Name: `FileView`
- Custom element: `asljs-file`
- Purpose: render one file through an ordered list of display handlers.

Notes:

- The component itself does not hard-code file types.
- File-type decisions belong to handlers.
- Providers abstract file lookup and optional text persistence.
- The package includes PDF, image, text, and text-editor handlers.

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

### Theme Provider Component

- Name: `ThemeProvider`
- Custom element: `asljs-theme-provider`
- Purpose: provide theme defaults to descendant components.

Notes:

- This is a lightweight provider element built directly on `HTMLElement`.
- Descendant components listen for theme changes and resolve local overrides
  before provider or package defaults.

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
- `getComponentVariantList`
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
