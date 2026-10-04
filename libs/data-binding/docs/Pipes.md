# Pipes

## Purpose

The value pipes of `asljs-data-binding`: the built-ins, how to add your own, how
they treat nullish values, and what happens when a pipe fails.

## Usage

A pipe transforms a value binding's value before it is written. Pipes chain left
to right, and take static string arguments separated by `:`:

```html
<div data-bind-text="name | upper"></div>
<div data-bind-text="amount | currency:GBP"></div>
<div data-bind-html="content | wrap:'<span>':'</span>'"></div>
```

Custom pipes are passed to `bindDataModel` in `options.pipes`:

```ts
const dispose =
  bindDataModel(
    root,
    model,
    {
      pipes:
        { yesno: value => value ? 'Yes' : 'No' }
    });
```

## Built-ins

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

## Locale

- By default, the `Intl`-based pipes use the runtime or browser locale.
- To force a locale, compose custom pipes from `createBuiltInPipes('en-GB')`.

## Nullish values

- Built-in pipes preserve `null` and `undefined` values.
- The binding target then decides what a nullish result means, as described in
  [Bindings][BND].

## Errors

- An unknown pipe throws.
- An exception thrown by a pipe propagates.

[BND]: Bindings.md
