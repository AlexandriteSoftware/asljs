# Bindings

## Purpose

The binding syntax of `asljs-data-binding`, family by family: what each
`data-bind-*` attribute writes or listens to, how paths resolve, and what
re-renders when the model changes.

## Package exports

Runtime exports:

- `bindDataModel(root, model, options?)` - binds every `data-bind-*` attribute
  under `root` to `model` and returns a function that removes the bindings. It
  returns `true` the first time it is called and `false`, doing nothing, after
  that.
- `createBuiltInPipes(locale?)` - creates the built-in pipe set, described in
  [Pipes][PIP].

Type exports:

- `BindDataModelOptions` - the options, `{ pipes?: Record<string, PipeFn> }`.
- `DataModel` - the model: any non-null `object`. A plain object, an object
  typed by an interface, a class instance and a converted observable are all
  accepted without a cast; only an observable model is bound reactively.
- `PipeFn` - a pipe, `(value, ...args: string[]) => unknown`.

## Binding contract

- Value bindings are path-based.
- Event bindings are path-based.
- A path is read property by property, `user.name` as `model.user.name`. No
  method on the model is called to resolve it: a model with a `get` method is
  read like any other object.
- Every segment of a path must be non-empty. `user.`, `user..name` and `.user`
  throw a `TypeError` when the template is bound, for a value, event or context
  binding, whether the model is a plain object or observable. Spaces around a
  segment are ignored.
- Context bindings switch the model root for a subtree.
- Pipe arguments are static strings.
- Event actions are invoked as `(event, model, element)`, with the object that
  holds the action as `this`.
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
- If you need to handle an event, then use `data-bind-on-<event>`.
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
- `data-bind-html` - `innerHTML`, written as it is; add the `safeHtml` pipe for
  markup that is not trusted, see [Pipes][PIP]
- `data-bind-<attr>` - an HTML attribute, for example `href`, `title`,
  `aria-label`
- `data-bind-prop-<name>` - a DOM property, for example `value`, `checked`,
  `read-only` for `readOnly`
- `data-bind-class-<name>` - a class toggled by the truthiness of the value

Names and case:

- The HTML parser, and `setAttribute`, lowercase every attribute name, and a
  `data-*` name must not contain uppercase letters, so a name is read in
  lowercase whatever case the template uses.
- `data-bind-prop-<name>` converts `<name>` the way `dataset` converts a
  `data-*` name: a hyphen followed by a lowercase letter becomes that letter in
  uppercase. `data-bind-prop-read-only` sets `readOnly`, and
  `data-bind-prop-text-content` sets `textContent`.
- `data-bind-<attr>` and `data-bind-class-<name>` use the name as written, so
  `data-bind-aria-label` writes `aria-label` and `data-bind-class-is-active`
  toggles `is-active`.
- Bind an attribute, not a property, where the DOM exposes the two under
  different names: `<label data-bind-for="inputId">` writes the `for` attribute.
  A label has no `for` property; its property is `htmlFor`.

Examples:

```html
<div data-bind-text="name"></div>
<div data-bind-text="name | upper"></div>
<div data-bind-text="createdAt | date:short"></div>
<div data-bind-text="amount | currency:GBP"></div>
<div data-bind-html="content | wrap:'<span>':'</span>'"></div>
<a data-bind-href="url"></a>
<input data-bind-prop-value="name">
<input data-bind-prop-read-only="locked">
<label data-bind-for="inputId"></label>
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
- `data-bind-prop-<name>` writes `false` to a property that currently holds a
  boolean, such as `hidden` or `disabled`, and `''` to any other, so an input
  bound to a missing value is empty rather than showing `undefined`.
- `data-bind-class-<name>` removes the class.

## Event bindings

General form:

```text
data-bind-on-<event>="actionPath"
```

Examples:

```html
<button data-bind-on-click="activate"></button>
<a data-bind-on-click="openDetails"></a>
<form data-bind-on-submit="save"></form>
```

Runtime behavior:

- `data-bind-on-click` listens to `click`, `data-bind-on-submit` listens to
  `submit`, and so on.
- The event name is everything after `on-`, used as written in the lowercase the
  parser gives it, so a hyphenated custom event works: `data-bind-on-key-submit`
  listens to `key-submit`. An event whose name has an uppercase letter, such as
  `valueChanged`, cannot be bound; listen to it with `addEventListener`.
- Any other `data-bind-on...` attribute, such as the earlier form
  `data-bind-onclick`, warns once and binds nothing. It is not bound as an
  attribute either: an `on*` attribute is an inline event handler, and a binding
  expression is not script.
- The action is resolved from the model by `actionPath`.
- When the action is a function, it is invoked as `(event, model, element)`.
- `this` is the object that holds the action: the context model for
  `data-bind-on-click="save"`, `model.user` for
  `data-bind-on-click="user.activate"`. It is read when the event fires, so a
  replaced `user` is the one used. A model method can therefore use `this`:

  ```ts
  const model =
    observable(
      { count: 0,
        increment()
        {
          this.count++;
        } });
  ```

  A function that is already bound, or an arrow function, keeps its own `this`.
- A missing or non-function action emits a warning and the binding stays alive.
- An action that throws emits a warning with the error, and the binding stays
  alive.

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
  data-bind-on-click="openDetails"
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
