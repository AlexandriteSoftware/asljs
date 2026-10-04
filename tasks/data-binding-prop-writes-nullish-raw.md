# data-binding-prop-writes-nullish-raw

A property binding assigns `null` and `undefined` as they are, so an input
bound to an absent value shows the text `undefined`.

Package: `data-binding`.

`writeBindingValue` has a nullish rule for every target but `prop`: text and
html render `''`, an attribute is removed, a class is toggled off. The `prop`
branch assigns the raw value:

```html
<input data-bind-prop-value="draft">
```

with `{ draft: undefined }` sets `input.value = undefined`, and the DOM
stringifies it: the field displays `undefined`. `null` happens to work for
`value` because that IDL attribute maps `null` to `''`, but `undefined` is the
value `readModelPath` yields for an unset property on an observable model and
the value the observable query reports for a missing segment, so it is the
common one.

`README.md` under "Nullish behavior" covers text, html and attributes and says
nothing about properties, and `AGENTS.md` lists the nullish contract as
"text/html render empty string, nullish attributes are removed". The property
case is unspecified rather than decided.

Proposed behaviour: decide and document. The least surprising rule is to write
`''` for a nullish value when the current property value is a string and
`false` when it is a boolean, and otherwise pass the value through; a simpler
rule that still fixes the visible case is to map nullish to `''` for `value`
alone. Either way add the `undefined` input case to
`write-binding-value.test.ts`, which today only writes `'abc'`.

## Where

- `libs/data-binding/src/write-binding-value.ts` - the `prop` branch.
- `libs/data-binding/src/write-binding-value.test.ts` - "writes property
  target".
- `libs/data-binding/README.md` - "Nullish behavior".
