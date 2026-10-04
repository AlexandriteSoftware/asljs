# Letterpad

`asljs-letterpad` is a visual keypad for alphabetic entry. It extends
[assisted input][AIN].

## Properties

- `characters` — the keys to enable
- `collapsed` — whether the keypad is hidden

`Backspace` and `Enter` are always allowed. When `characters` is a non-empty
string, single-character keys are enabled only if that string contains the key.

The keyboard toggle button flips `collapsed` and updates its own accessible
label between `Show letterpad` and `Hide letterpad`.

## Events

- `key`, bubbling, with the detail `{ key: string }`
- `submit`, bubbling, for Enter

## Usage

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

[AIN]: <Assisted Input.md>
