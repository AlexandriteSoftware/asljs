# data-binding-prop-writes-nullish-raw

A property binding assigns `null` and `undefined` as they are, so an input bound
to an absent value shows the text `undefined`.

Package: `data-binding`.

## Context

A value binding such as `data-bind-prop-value="draft"` runs, in call order:

- `bindValueModel` builds an `update` function and runs it now and on every
  change of the path (`watchModelPath`); `update` ignores the value the
  subscription reports and re-reads the model.
- `readModelPath(model, path)` reads the value: through `model.get(path)` when
  the model has a `get` method, otherwise by walking the dotted path.
- The pipes run, then `writeBindingValue(element, spec.target, value)` writes
  the result. For `prop-<name>` the target is `{ kind: 'prop', name }`.

`libs/data-binding/src/bind-value-model.ts`:

```ts
    const rawValue =
      readModelPath(
        model,
        spec.path);

    const formattedValue =
      applyPipes(
        rawValue,
        compiledPipes);

    writeBindingValue(
      element,
      spec.target,
      formattedValue);
```

`libs/data-binding/src/read-model-path.ts` - a missing segment yields `null`, an
existing key holding `undefined` yields `undefined`:

```ts
for (const part of parts) {
  if (
    typeof current
    !== 'object'
    || current === null
    || !(part in current)
  ) {
    return null;
  }
```

`libs/data-binding/src/write-binding-value.ts` - `class` uses truthiness, `prop`
assigns as is, `attr` removes on nullish, and text and html go through
`coerceDisplayValue`, which maps nullish to `''`:

```ts
  if (target.kind === 'prop') {
    const propertyName =
      target.name as keyof HTMLElement;

    (element[propertyName] as unknown) = value;

    return;
  }

  if (target.kind === 'attr') {
    if (
      value === null
      || value === undefined
    ) {
      element.removeAttribute(
        target.name);
```

## Problem

`writeBindingValue` has a nullish rule for every target but `prop`: text and
html render `''`, an attribute is removed, a class is toggled off. The `prop`
branch assigns the raw value:

```html
<input data-bind-prop-value="draft">
```

with `{ draft: undefined }` sets `input.value = undefined`, and the DOM
stringifies it: the field displays `undefined`. `null` happens to work for
`value` because that IDL attribute maps `null` to `''`. `undefined` reaches the
binding when the key exists but holds `undefined` (an optional field declared
and not yet filled, which is how model objects are usually initialised) or when
a model's own `get(path)` returns `undefined` for an unset path. A key that is
absent altogether reads as `null` and does not show the bug for `value`.

`docs/Bindings.md` under "Value bindings", in the "Nullish values" list, covers
text, html and attributes and says nothing about properties, and `AGENTS.md`
lists the nullish contract as "text/html render empty string, nullish attributes
are removed". The property case is unspecified rather than decided.

Proposed behaviour: decide and document. The least surprising rule is to write
`''` for a nullish value when the current property value is a string and `false`
when it is a boolean, and otherwise pass the value through; a simpler rule that
still fixes the visible case is to map nullish to `''` for `value` alone. Either
way add the `undefined` input case to `write-binding-value.test.ts`, which today
only writes `'abc'`.

## Where

- `libs/data-binding/src/write-binding-value.ts` - the `prop` branch.
- `libs/data-binding/src/write-binding-value.test.ts` - "writes property
  target".
- `libs/data-binding/src/read-model-path.ts` - where `null` and `undefined` come
  from.
- `libs/data-binding/docs/Bindings.md` - "Value bindings", "Nullish values"
  list.
- `libs/data-binding/AGENTS.md` - the nullish contract.
