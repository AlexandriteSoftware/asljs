# Bindings

## Purpose

The binding syntax of `asljs-data-binding`, family by family: what each
`data-bind-*` attribute writes or listens to, how paths resolve, and what
re-renders when the model changes.

## Package exports

Runtime exports:

- `bindDataModel(root, model, options?)` - binds every `data-bind-*` attribute
  under `root` to `model` and returns a function that removes the bindings.
- `createBuiltInPipes(locale?)` - creates the built-in pipe set, described in
  [Pipes][PIP].

Type exports:

- `BindDataModelOptions`
- `DataModel`

## Binding contract

- Value bindings are path-based.
- Event bindings are path-based.
- Context bindings switch the model root for a subtree.
- Pipe arguments are static strings.
- Event actions are invoked as `(event, model, element)`.
- Missing or non-function actions warn instead of stopping the binding system.

Bindings are reactive when the model conforms to the `asljs-observable`
contract: each binding observes its path with `observe(model).at(path)` and
re-renders when the value there changes. A plain object is bound once, with no
reactivity.

## Choosing a binding family

- If you need to write text, then use `data-bind-text`.
- If you need to write HTML, then use `data-bind-html`.
- If you need to write an attribute, then use `data-bind-<attr>`.
- If you need to write a DOM property, then use `data-bind-prop-<name>`.
- If you need to toggle a class, then use `data-bind-class-<name>`.
- If you need to handle an event, then use `data-bind-on<event>`.
- If you need to switch the descendant model root, then use `data-bind-context`.

## Context binding

`data-bind-context` switches the model context for the entire descendant
subtree.

General form:

```text
data-bind-context="path"
```

The `path` is resolved against the current model. The resulting object becomes
the model context for all descendant bindings.

Binding to a nested object:

```html
<div data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <span data-bind-text="email"></span>
</div>
```

This is equivalent to writing `user.name` and `user.email` on the descendants
without the context switch.

Nested `data-bind-context` attributes stack:

```html
<div data-bind-context="item">
  <div data-bind-context="author">
    <span data-bind-text="name"></span>
  </div>
</div>
```

Here `name` resolves relative to `item.author`.

Reactivity:

- `data-bind-context` watches its path on the parent context.
- When the context object is replaced, all descendant bindings are rebound
  against the new context.
- Watchers from the old context are removed.

Null and undefined context:

- If the path resolves to `null` or `undefined`, descendant bindings follow the
  nullish rules below: empty text, removed attributes, action warnings.
- If the context later becomes a non-null object, descendants become active
  again.

## Value bindings

General form:

```text
data-bind-<target>="path[ | pipe[:arg1[:arg2...]]]*"
```

Pipe arguments can be quoted when they contain characters like `:`.

```text
data-bind-html="content | wrap:'<span>':'</span>'"
```

Targets:

- `data-bind-text` - `textContent`
- `data-bind-html` - `innerHTML`
- `data-bind-<attr>` - an HTML attribute, for example `href`, `title`,
  `aria-label`
- `data-bind-prop-<name>` - a DOM property, for example `value`, `checked`
- `data-bind-class-<name>` - a class toggled by the truthiness of the value

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

Reactivity:

- A value binding depends only on its `path`, and subscribes to updates for that
  path.
- Pipe arguments are static strings and are not reactive.

Nullish values:

- `data-bind-text` and `data-bind-html` render `null` and `undefined` as `''`.
- `data-bind-<attr>` removes the attribute when the final value is `null` or
  `undefined`.

## Event bindings

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
  `submit`, and so on.
- The action is resolved from the model by `actionPath`.
- When the action is a function, it is invoked as `(event, model, element)`.
- A missing or non-function action emits a warning and the binding stays alive.

Reactivity:

- An event binding depends only on `actionPath`, and subscribes to updates for
  that path.
- The handler reference refreshes when the action changes.

## Several bindings on one element

Several bindings on the same element are supported and preferred when they
describe different concerns:

```html
<a
  data-bind-href="url"
  data-bind-text="label | upper"
  data-bind-class-active="isActive"
  data-bind-onclick="openDetails"
></a>
```

## Authoring rules

- Keep each binding attribute focused on one concern.
- Prefer several binding attributes over one overloaded expression.
- Use `data-bind-context` instead of repeating long nested paths.
- Keep event handler names on the model.
- Keep pipe arguments literal unless a custom pipe is designed for string
  arguments.

## Scope

Binding attributes hold a path, optionally followed by pipes. The following are
outside that syntax:

- inline function-call expressions such as `save(item.id)`
- computed expressions such as `price * qty`
- reactive pipe arguments
- template-language control structures inside attributes
- implicit two-way binding

[PIP]: Pipes.md
