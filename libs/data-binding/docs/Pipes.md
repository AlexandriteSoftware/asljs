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

A pipe defined on its own is typed with `PipeFn`:

```ts
import { type PipeFn }
  from 'asljs-data-binding';

const yesno: PipeFn =
  value => value ? 'Yes' : 'No';
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
- `safeHtml` - sanitizes HTML for `data-bind-html`; see below.

### safeHtml

`safeHtml` passes the value through [DOMPurify][DPF], which removes scripts,
event-handler attributes such as `onerror`, `javascript:` URLs and other active
content, and returns the remaining markup:

```html
<div data-bind-html="comment.body | safeHtml"></div>
```

- `data-bind-html` writes `innerHTML` as it is. Put `safeHtml` last in the chain
  whenever the markup can come from a user or another untrusted source.
- `null` and `undefined` pass through, like the other built-ins; any other value
  is converted to a string first.
- It sanitizes with the current window, `globalThis.window`: the page in a
  browser. In tests and on a server, install a window first, for example a JSDOM
  window with `TmpGlobals` from `asljs-testing`.
- With no window, or a window DOMPurify cannot work with, it throws. It never
  returns the markup unsanitized.
- DOMPurify's default configuration applies. A custom pipe that calls
  `DOMPurify.sanitize` with its own options covers other needs.

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
[DPF]: https://github.com/cure53/DOMPurify
