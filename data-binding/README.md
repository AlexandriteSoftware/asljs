# data-binding

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-data-binding` provides declarative DOM bindings using explicit
`data-bind-*` attributes. Bindings are applied with
`bindDataModel(root, model, options?)`.

There are three binding families:

- Value bindings: write model values to `textContent`, `innerHTML`, or an
  attribute.
- Event bindings: wire DOM events to model actions.
- Context bindings: switch the model context for a descendant subtree.

Both families support lightweight reactivity through `observable.watch(...)`
on the configured model path.

## Installation

```bash
npm install asljs-data-binding
```

NPM Package:
[asljs-data-binding](https://www.npmjs.com/package/asljs-data-binding)

## Public Exports

Runtime exports:

- `bindDataModel`
- `createBuiltInPipes`

Type exports:

- `BindDataModelOptions`
- `DataModel`

## Binding Contract At A Glance

- Value bindings are path-based.
- Event bindings are path-based.
- Context bindings switch subtree model roots.
- Pipe args are static strings.
- Event actions are invoked as `(event, model, element)`.
- Missing or non-function actions warn instead of crashing the binding system.

## Unsupported Syntax

- No inline function-call expressions like `save(item.id)`.
- No computed expressions like `price * qty`.
- No reactive pipe arguments.
- No template-language control structures inside attributes.
- No implicit two-way binding syntax.

## Choosing The Right Binding Family

- If you need to write text, then use `data-bind-text`.
- If you need to write HTML, then use `data-bind-html`.
- If you need to write an attribute, then use `data-bind-<attr>`.
- If you need to write a DOM property, then use `data-bind-prop-<name>`.
- If you need to toggle a class, then use `data-bind-class-<name>`.
- If you need to handle an event, then use `data-bind-on<event>`.
- If you need to switch the descendant model root, then use
  `data-bind-context`.

## Safe Authoring Rules

- Keep each binding attribute focused on one concern.
- Prefer multiple binding attributes over overloaded single expressions.
- Use `data-bind-context` instead of repeating long nested paths.
- Keep event handler names on the model.
- Keep pipe arguments literal unless a custom pipe is intentionally designed
  for string arguments.

## Usage

```ts
import {
    bindDataModel
  } from 'asljs-data-binding';
import {
    observable
  } from 'asljs-observable';

const root =
  document.body;

const model =
  observable(
    { user:
        { name: 'Alex' },
      save: () => {
        console.log('saved');
      } });

const dispose =
  bindDataModel(
    root,
    model,
    {
      pipes:
        { yesno: value => value ? 'Yes' : 'No' }
    });

// later:
dispose();
```

Example bindings:

```html
<div data-bind-text="user.name"></div>
<div data-bind-text="user.active | yesno"></div>
<div data-bind-html="body | wrap:'<span>':'</span>'"></div>
<button data-bind-onclick="save">Save</button>
```

Use `data-bind-context` to switch the model context for a subtree:

```html
<div data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <button data-bind-onclick="save">Save</button>
</div>
```

Multiple bindings on the same element are supported and preferred when they
describe different concerns:

```html
<a
  data-bind-href="url"
  data-bind-text="label | upper"
  data-bind-class-active="isActive"
  data-bind-onclick="openDetails"
></a>
```

End-to-end example using context, value bindings, an event binding, and a
custom pipe:

```html
<section data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <p data-bind-text="active | yesno"></p>
  <a data-bind-href="profileUrl" data-bind-text="name | upper"></a>
  <button data-bind-onclick="save">Save</button>
</section>
```

## Binding Syntax

### Context binding

`data-bind-context` switches the model context for the entire descendant
subtree.

General form:

```text
data-bind-context="path"
```

The `path` is resolved against the current model. The resulting object becomes
the model context for all descendant bindings.

Example — binding to a nested object:

```html
<div data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <span data-bind-text="email"></span>
</div>
```

This is equivalent to writing `user.name` and `user.email` on the descendants
without the context switch.

Nested `data-bind-context` attributes stack naturally:

```html
<div data-bind-context="item">
  <div data-bind-context="author">
    <span data-bind-text="name"></span>
  </div>
</div>
```

Here `name` resolves relative to `item.author`.

Reactivity:

- `data-bind-context` watches its path on the parent context
- when the context object is replaced, all descendant bindings are rebound
  against the new context
- stale watchers from the old context are removed

Null/undefined context:

- if the path resolves to `null` or `undefined`, descendant bindings degrade
  gracefully following the existing nullish conventions (empty text, removed
  attributes, action warnings)
- if the context later becomes a non-null object, descendants become active
  again

### Value bindings

General form:

```text
data-bind-<target>="path[ | pipe[:arg1[:arg2...]]]*"
```

Pipe arguments can be quoted when they contain characters like `:`.

```text
data-bind-html="content | wrap:'<span>':'</span>'"
```

Supported targets:

- `data-bind-text` -> `textContent`
- `data-bind-html` -> `innerHTML`
- `data-bind-<attr>` -> HTML attribute (for example `href`, `title`,
  `aria-label`)
- `data-bind-prop-<name>` -> DOM property (for example `value`, `checked`)
- `data-bind-class-<name>` -> class toggle by truthy/falsy value

Examples:

```html
<div data-bind-text="name"></div>
<div data-bind-text="name | upper"></div>
<div data-bind-text="createdAt | date:short"></div>
<div data-bind-text="amount | currency:GBP"></div>
<div data-bind-html="content | wrap:'<span>':'</span>'"></div>
<a data-bind-href="url"></a>
<input data-bind-prop-value="name">
<button data-bind-class-active="isSelected"></button>
<div data-bind-html="body | safeHtml"></div>
```

Reactivity for value bindings:

- depends only on `path`
- subscribes to updates for that path
- pipe args are static strings and are not reactive

### Event bindings

General form:

```text
data-bind-on<event>="actionPath"
```

Examples:

```html
<button data-bind-onclick="activate"></button>
<a data-bind-onclick="openDetails"></a>
<form data-bind-onsubmit="save"></form>
```

Runtime behavior:

- `data-bind-onclick` listens to `click`, `data-bind-onsubmit` listens to
  `submit`, etc.
- action is resolved from model by `actionPath`
- when action is a function, it is invoked as `(event, model, element)`
- missing or non-function actions emit warnings and keep binding alive

Reactivity for event bindings:

- depends only on `actionPath`
- subscribes to updates for that path
- handler reference refreshes when action changes

## Built-ins

Value pipes:

- `string`
- `number`
- `currency[:code]`
- `date[:format]`
- `datetime[:format]`
- `fixed[:digits]`
- `upper`
- `lower`
- `json[:spaces]`
- `default:value`
- `safeHtml`

Locale behavior:

- by default, `Intl` pipes use runtime/browser locale settings
- to force a locale, compose custom pipes using `createBuiltInPipes('en-GB')`
  in your own implementation

## Error Handling

- unknown pipe: throws
- pipe error: exception from pipe propagates
- missing/non-function action: warning, binding continues

Behavior at a glance:

- `data-bind-text` with `null` or `undefined` renders `''`.
- `data-bind-html` with `null` or `undefined` renders `''`.
- `data-bind-<attr>` with `null` or `undefined` removes the attribute.
- Unknown pipes throw.
- Pipe exceptions propagate.
- Missing or non-function event handlers warn and keep bindings alive.

Nullish behavior:

- built-in pipes preserve `null` and `undefined` values
- `data-bind-text` and `data-bind-html` render `null`/`undefined` as `''`
- `data-bind-<attr>` removes the attribute when final value is `null` or
  `undefined`

## API Reference

Core API:

- `bindDataModel(root, model, options)`

Types are exported from:

- `BindDataModelOptions`
- `DataModel`

## Related Packages

- For model reactivity itself, see `asljs-observable`.
- For event primitives, see `asljs-eventful`.
- For reusable UI elements, see `asljs-components`.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
