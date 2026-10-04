# Properties

`asljs-properties` renders an editor form for the editable properties of a
component, from its model definition.

## Model definitions

The package exports a runtime model definition for each public component, such
as `TextInputModelDefinition` and `ButtonModelDefinition`. Each definition's
`properties` array describes the component's runtime-visible properties, and
each entry has:

- `name`
- `type`
- optional `title`
- optional `description`
- optional `editable`

The definitions can be used directly or passed to `asljs-properties`.

```ts
import {
    TextInputModelDefinition,
  } from 'asljs-components';

console.log(
  TextInputModelDefinition.properties);
```

## The editor

- String and number properties use [`asljs-text-input`][TXT].
- Boolean properties use [`asljs-select`][SEL] with `Yes` and `No`.
- Object, array, function and read-only values are shown as read-only fields,
  and the editor does not change them.

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

[SEL]: Select.md
[TXT]: <Text Input.md>
