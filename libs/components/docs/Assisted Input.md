# Assisted Input

`AssistedInput` is the shared Lit base class for the package's on-screen input
surfaces: [keyboard][KBD], [letterpad][LTR] and
[numpad][NUM]. It is not a custom element itself.

It owns the common assisted-input contract:

- `characters` filtering: `Backspace` and `Enter` are always allowed; when
  `characters` is a non-empty string, single-character keys are enabled only if
  that string contains the key
- host accessibility defaults with `role="group"`
- bubbling `key` dispatch with the detail `{ key: string }`
- bubbling `submit` dispatch for Enter
- pointer-down suppression, to keep focus on the target field

The components that extend it provide only their layout-specific rendering and
special interaction rules.

[KBD]: <Keyboard.md>
[LTR]: <Letterpad.md>
[NUM]: <Numpad.md>
