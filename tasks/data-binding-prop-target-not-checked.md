# data-binding-prop-target-not-checked

`data-bind-prop-<name>` assigns to any name, so a property the element does not
have becomes an expando and nothing warns.

Package: `data-binding`.

`writeBindingValue` assigns `element[name] = value` for a `prop` target without
checking that `name` is a property of the element. Assigning an unknown name
succeeds: it creates a plain JavaScript property that the DOM ignores. That is
how `<label data-bind-prop-for="inputId">` shipped in `asljs-components`: a
label has no `for` property, only `htmlFor` and the `for` attribute, so the
binding wrote `label.for` and the label was not associated with its control.
Those call sites now use `data-bind-for`, and the text-input and select tests
assert `label.htmlFor`, but the next misnamed property would fail the same
silent way.

Attribute names reach the binding lowercased, and `data-bind-prop-<name>`
converts `<name>` with the `dataset` rule (`read-only` to `readOnly`), so a
camel-case property is reachable; a name that does not exist on the element is
still accepted.

Proposed behaviour: warn once, through the binding's `warnOnce`, when a `prop`
target is not already a property of the element (`!(name in element)`), naming
the binding and suggesting the attribute binding. Keep the assignment, so a
custom element that defines the property later, or an intentional expando, keeps
working.

## Where

- `libs/data-binding/src/write-binding-value.ts` - the `prop` branch.
- `libs/data-binding/src/bind-value-model.ts` - where `warnOnce` would reach the
  check.
- `libs/data-binding/docs/Bindings.md` - "Value bindings", "Names and case".
