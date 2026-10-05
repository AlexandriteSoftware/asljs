# data-binding

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-data-binding` binds DOM elements to a model through explicit
`data-bind-*` attributes. One call, `bindDataModel(root, model, options?)`,
applies every binding under `root`.

There are three binding families:

- Value bindings write model values to `textContent`, `innerHTML`, an attribute,
  a DOM property, or a class.
- Event bindings wire DOM events to model actions.
- Context bindings switch the model context for a descendant subtree.

Bindings are reactive when the model conforms to the `asljs-observable`
contract: each binding observes its path and re-renders when the value there
changes. A plain object is bound once, with no reactivity.

## Scope

A binding attribute holds a model path, optionally followed by pipes with static
string arguments. Expressions, inline function calls, control structures and
two-way binding syntax are outside that syntax; that logic lives on the model.

## Installation

```bash
npm install asljs-data-binding
```

NPM Package: [asljs-data-binding][NPM]

## Usage

```ts
import {
    bindDataModel
  } from 'asljs-data-binding';
import {
    observable
  } from 'asljs-observable';

const model =
  observable(
    { user:
        { name: 'Alex',
          active: true },
      save: () => {
        console.log('saved');
      } },
    { deep: true });

const dispose =
  bindDataModel(
    document.body,
    model,
    {
      pipes:
        { yesno: value => value ? 'Yes' : 'No' }
    });

// later:
dispose();
```

```html
<section data-bind-context="user">
  <h1 data-bind-text="name | upper"></h1>
  <p data-bind-text="active | yesno"></p>
</section>
<button data-bind-on-click="save">Save</button>
```

`data-bind-context` makes `name` and `active` resolve against `user`. Event
actions are called as `(event, model, element)`.

## Further reading

- [Bindings][BND] - the syntax and reactivity rules of each binding family.
- [Pipes][PIP] - the built-in pipes, custom pipes, locale and error handling.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- `asljs-observable` makes the model reactive.
- `asljs-eventful` provides the event primitives underneath.
- `asljs-components` provides UI elements whose templates use these bindings.

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[BND]: docs/Bindings.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
[NPM]: https://www.npmjs.com/package/asljs-data-binding
[PIP]: docs/Pipes.md
