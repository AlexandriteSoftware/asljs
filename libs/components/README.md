# components

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-components` is a catalog of reusable UI components for web applications:
buttons, text inputs, selects, lists, file views, on-screen keypads, a generated
property editor and an AI chat. Each is a custom element with an explicit
property-and-event contract, and their layout comes from templates and themes
rather than from code.

## Scope

The components fit ASLJS applications that bind state with `asljs-data-binding`
and `asljs-observable`. Rendering is template-driven: rows, layouts and controls
come from slot templates and themes, and event handlers are binding paths.
Render callbacks and inline template expressions are outside that model.

## Installation

```bash
npm install asljs-components
```

NPM package: [asljs-components][NPM]

## Usage

Import the package once to register the custom elements, then create and
configure them through ordinary DOM APIs:

```ts
import 'asljs-components';

const input =
  document.createElement('asljs-text-input') as HTMLElement & {
    label: string | null;
    validator: ((value: string) => string | null) | null;
  };

input.label = 'Name';
input.validator =
  value => value.trim() === ''
    ? 'Name is required.'
    : null;

input.addEventListener(
  'change',
  event => console.log((event as CustomEvent<{ value: string }>).detail.value));

document.body.appendChild(input);
```

The components:

- [`asljs-button`][BTN] — an icon-plus-text button with theme variants
- [`asljs-text-input`][TXT] — a text field or textarea with validation
- [`asljs-select`][SEL] — a drop-down with validation
- [`asljs-list`][LST] — a collection rendered from templates
- [`asljs-file`][FIL] — a file view with pluggable display handlers
- [`asljs-keyboard`][KBD], [`asljs-letterpad`][LTR] and [`asljs-numpad`][NUM] —
  on-screen keypads, built on [`AssistedInput`][AIN]
- [`asljs-properties`][PRP] — an editor generated from a component's model
  definition
- [`asljs-theme-provider`][THP] — theme defaults for a subtree
- [`asljs-ai-chat`][CHT] and `asljs-ai-chat-key` — a chat UI and an API key
  prompt

## Further reading

- [Theming][THM] — templates, themes and how they combine.
- [Components][CMP] — the component model shared by the package.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- `asljs-data-binding` for the binding rules the templates use.
- `asljs-observable` for state reactivity.
- `asljs-eventful` for event primitives.

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[AIN]: <docs/Assisted Input.md>
[BTN]: docs/Button.md
[CHT]: <docs/AI Chat.md>
[CMP]: docs/Components.md
[FIL]: docs/File.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[KBD]: docs/Keyboard.md
[LIC]: LICENSE.md
[LST]: docs/List.md
[LTR]: docs/Letterpad.md
[NPM]: https://www.npmjs.com/package/asljs-components
[NUM]: docs/Numpad.md
[PRP]: docs/Properties.md
[SEL]: docs/Select.md
[THM]: docs/Theming.md
[THP]: <docs/Theme Provider.md>
[TXT]: <docs/Text Input.md>
