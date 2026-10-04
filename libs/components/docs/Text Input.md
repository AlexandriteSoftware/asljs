# Text Input

`asljs-text-input` is a labelled text field or textarea with validation.

## Properties

- `value` — the external set/reset value
- `label`
- `description`
- `placeholder`
- `validator` — returns an error message or `null`
- `multiline` — renders a textarea instead of an input
- `enterKeyBehavior` — `finish` or `newline`
- `autoExtend` and `autoExtendMaxRows` — textarea growth
- `theme`
- local `template[data-slot="template"]`, `template[data-slot="input"]` and
  `template[data-slot="textarea"]`

`value` is a set/reset input, not the live draft. User edits are kept in
`draftValue`, reflected in the observable `status` object, and emitted through
`input` and `change` events whose detail reports the draft value, validity and
dirty state. Listen for those events and decide whether to persist or reset.

## Usage

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

## Template overrides

Provide a local `template[data-slot="template"]` when the layout must differ
from the Bootstrap-oriented default. The template can use any supported
`asljs-data-binding` attributes, but it must include
`[data-role="control-host"]` so the component can mount the actual `input` or
`textarea`.

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

Provide `template[data-slot="input"]` or `template[data-slot="textarea"]` when
the native control markup itself must come from the local component or theme.
The slot must include the matching native control element, but wrapper markup
around it is allowed. Control templates can also use `asljs-data-binding`
attributes, for example to place validation feedback next to the real control.

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

Themes can supply the same templates; see [Theming][THM].

[THM]: Theming.md
