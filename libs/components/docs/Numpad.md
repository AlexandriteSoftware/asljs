# Numpad

`asljs-numpad` is a visual keypad for numeric and operator entry. It extends
[assisted input][AIN].

## Properties

- `characters` — the keys to enable

`Backspace` and `Enter` are always allowed. When `characters` is a non-empty
string, single-character keys are enabled only if that string contains the key.

## Events

- `key`, bubbling, with the detail `{ key: string }`

## Usage

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

[AIN]: <Assisted Input.md>
