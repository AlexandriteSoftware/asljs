# data-binding-binding-names-are-lowercased

`data-bind-prop-<name>` and `data-bind-on<event>` take the name from the
attribute, which the HTML parser lowercases, so camel-case DOM properties and
event names are unreachable and the mismatch is silent.

Package: `data-binding`.

`bindElementAttributes` reads `attribute.name` and `resolveValueTarget` and
`createBindingSpec` slice the property or event name out of it. In an HTML
document every attribute name is lowercase by the time it is read, so:

- `data-bind-prop-readOnly="ro"` sets `element.readonly`, an expando;
  `element.readOnly` stays `false`.
- `data-bind-prop-innerText="t"` sets `element.innertext`; the element stays
  empty.
- `data-bind-onvalueChanged="h"` listens to `valuechanged`; a
  `new CustomEvent('valueChanged')` never reaches `h`.

Nothing warns: assigning an unknown property to an element succeeds, and
`addEventListener` accepts any name.

The case already shipping is `for`. The default templates in
`libs/components/src/text-input.ts` and `libs/components/src/select.ts`, the
Bootstrap theme, and the components README use
`<label data-bind-prop-for="inputId">`. A label has no `for` property, only
`htmlFor` and the `for` attribute, so the binding writes `label.for = 'x1'`
as an expando: `label.htmlFor` is `''`, `getAttribute('for')` is `null`, and
the label is not associated with the control. The components tests never
assert the association, which is why it has not been noticed. `data-bind-for`
(the attribute binding) does what was intended.

`README.md` presents `data-bind-prop-<name>` with `value` and `checked`, which
happen to be lowercase, and does not mention the limit.

Proposed behaviour, in order of value:

- Document that the property and event name are taken from the attribute as
  the parser reports it, so only lowercase names work, and that attributes are
  the right binding for `for`, `tabindex`, `aria-*` and anything the DOM
  exposes under a different name.
- Fix the four components call sites to `data-bind-for`, and add an assertion
  on `label.htmlFor` to the text-input and select tests.
- Optionally, warn once when a `prop` target is not already a property of the
  element (`!(name in element)`), which would have caught this.

Mapping lowercase names to their camel-case properties (`readonly` to
`readOnly`) is possible but needs a table; a warning plus the attribute binding
covers the real cases.

## Where

- `libs/data-binding/src/bind-data-model.ts` - `bindElementAttributes`,
  `createBindingSpec`, `resolveValueTarget`.
- `libs/data-binding/src/write-binding-value.ts` - the `prop` branch, which
  assigns without checking the property exists.
- `libs/data-binding/README.md` - "Value bindings" and "Event bindings".
- `libs/components/src/text-input.ts`, `libs/components/src/select.ts`,
  `libs/components/src/themes/bootstrap-theme.ts`,
  `libs/components/README.md` - `data-bind-prop-for`.
