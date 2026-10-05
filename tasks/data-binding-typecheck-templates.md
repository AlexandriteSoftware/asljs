# data-binding-typecheck-templates

Binding templates are not type-checked, so a binding that names a property the
model or the element does not have fails silently at run time.

Package: `data-binding`.

## Context

A template is markup in a TypeScript string, and its model has a real type next
to it, but nothing connects the two. In `libs/components/src/text-input.ts`:

```ts
type TextInputTemplateModel = Converted<{
  label: string;
  description: string;
// ...
  inputId: string;
```

```ts
template.innerHTML =
  `
    <div>
      <label
             data-bind-text="label"
             data-bind-prop-hidden="hideLabel"
             data-bind-for="inputId"></label>
```

`bindDataModel` reads each `data-bind-*` attribute at run time, resolves its
path against the model and writes the element. A misspelled path reads `null`,
and a property the element does not have becomes an expando. That is how `<label
data-bind-prop-for="inputId">` shipped in `asljs-components`: a label has no
`for` property, so the binding wrote `label.for` and the labels were not
associated with their controls. Five templates had it; the tests did not notice
until they asserted `label.htmlFor`.

## Problem

Every fact a check needs is available before run time: the element type follows
from the tag (`HTMLElementTagNameMap`), the model type is declared, and each
binding names a path and a target. The type checker could reject `label.for =
model.inputId` (TS2339) or `model.lable` the moment the template is written, but
the template is a string it never sees.

Proposed behaviour: compile templates to TypeScript and type-check them.

- An attribute on the template, or on its root element, names the model type,
  for example `data-bind-model="TextInputTemplateModel"`.
- A tool turns each binding into a TypeScript statement over that type and the
  element's type:
  - `data-bind-text="label"` - `model.label` must exist;
  - `data-bind-prop-hidden="hideLabel"` - `label.hidden = model.hideLabel` must
    type-check, which catches both a missing property (`for`) and a wrong value
    type;
  - `data-bind-<attr>` - the value must be a string, number, boolean or nullish;
  - `data-bind-on-click="save"` - `model.save` must be a function;
  - `data-bind-context="user"` - the descendants are checked against the type of
    `model.user`;
  - a pipe name must be a built-in or a declared custom pipe.
- It runs the type checker on the generated code and reports each error against
  the template: the file, the line and the attribute, for example
  `text-input.ts:990: data-bind-prop-for: Property 'for' does not exist on type
  'HTMLLabelElement'`.

Points to settle:

- How the tool finds templates: string literals assigned to
  ``template.innerHTML``, a tagged template such as ``html\``...\```, theme
  objects (``libs/components/src/themes/bootstrap-theme.ts`), and markdown
  examples are all in use.
- How the type name resolves: in the module that holds the template, or through
  an import specifier in the attribute.
- Templates whose model is generic, such as `List` rows, where `item` is the
  caller's type.
- Where it runs: a `data-binding` CLI, a `toolkit` command in `flint`, or a
  `part` rule.

## Where

- `libs/data-binding/src/parse-data-model-binding.ts` - the binding grammar the
  tool must share.
- `libs/data-binding/src/bind-data-model.ts` - how attribute names map to
  targets (`prop-`, `class-`, `on-`, attributes).
- `libs/components/src/text-input.ts`, `libs/components/src/select.ts`,
  `libs/components/src/list.ts`, `libs/components/src/themes/bootstrap-theme.ts`
  - the templates and their model types.
- `libs/data-binding/docs/Bindings.md` - the binding syntax to document the
  attribute in.
