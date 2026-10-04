# Keyboard

`asljs-keyboard` is a visual full-keyboard surface, a fixed QWERTY layout, for
mixed text entry. It extends [assisted input][AIN].

## Properties

- `characters` — the keys to enable

`Backspace` and `Enter` are always allowed. When `characters` is a non-empty
string, single-character keys are enabled only if that string contains the key.
This includes digits, punctuation and a literal space.

## Events

- `key`, bubbling, with the detail `{ key: string }`
- `submit`, bubbling, for Enter

## Usage

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

[AIN]: <Assisted Input.md>
