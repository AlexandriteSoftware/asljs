# Select

`asljs-select` is a labelled drop-down with validation.

## Properties

- `items` — explicit `{ value, label, disabled? }` entries
- `value` — the external set/reset selection
- `label`
- `description`
- `placeholder` — when set, an empty prompt option is shown first
- `validator` — returns an error message or `null`
- `disabled`
- `controlClassName` — a class for the inner native `select`, for host CSS
- `theme`
- local `template[data-slot="template"]` and `template[data-slot="select"]`

As with [text input][TXT], `value` is a set/reset input. The user's
selection is kept in `draftValue`, reflected in the observable `status` object,
and emitted through `input` and `change` events. Their detail is:

```ts
{
  value: string;
  isEmpty: boolean;
  isValid: boolean;
  errorMessage: string | null;
  dirty: boolean;
}
```

## Usage

```ts
import 'asljs-components';

const select =
  document.createElement('asljs-select') as HTMLElement & {
    label: string | null;
    items: Array<{ value: string; label: string; disabled?: boolean }>;
    value: string | null;
    placeholder: string | null;
  };

select.label = 'Size';
select.placeholder = 'Choose a size';
select.items =
  [ { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large', disabled: true } ];
select.value = 'm';

select.addEventListener(
  'change',
  event => {
    const detail =
      (event as CustomEvent<{ value: string; isValid: boolean }>).detail;

    console.log(detail.value, detail.isValid);
  });
```

Layout and control markup can be overridden with local slot templates or a
theme, as for text input; see [Theming][THM].

[THM]: <Theming.md>
[TXT]: <Text Input.md>
