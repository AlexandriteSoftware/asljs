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
- `default:value` - `value` in place of `null`, `undefined` or `''`; any other
  value, `0` and `false` included, passes through.
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

## Dates

`date[:format]` and `datetime[:format]` take a `Date`, a number of milliseconds
or a string. There is no `time` pipe; a pattern gives the time alone.

The format is a style name or a pattern:

- `short`, `medium`, `long`, `full` - the locale's own layout, through
  `Intl.DateTimeFormat`. `date` formats the date (`date:long` -> `3 February
  2026`), `datetime` the date and the time (`datetime` -> `03/02/2026, 14:05` in
  `en-GB`). The default is `short`.
- A pattern of `yyyy`, `yy`, `MM` (month), `dd`, `hh` (hour, 0-23), `mm`
  (minute) and `ss`; any other character is written as it is, and `\` escapes
  one. `date` and `datetime` give the same result for a pattern.

Arguments are separated by `:`, so quote a pattern that contains one:
`date:'hh:mm'` gives `14:05`, while `date:hh:mm` passes `hh` and `mm` as two
arguments and gives `14`.

Strings:

- A date without a time, `YYYY-MM-DD` as a JSON API or `<input type="date">`
  gives it, is that calendar day in local time: `2026-02-03` renders as 3
  February in every time zone.
- A day the month does not have, such as `2026-02-30`, renders as `''`, like any
  other value that is not a date.
- Any other string, including one with a time, is parsed by the platform's
  `Date`: `2026-02-03T00:00:00Z` is UTC midnight, which is 2 February in New
  York.

The output is in the runtime's time zone.

## Locale

- By default, the `Intl`-based pipes use the runtime or browser locale.
- To force a locale, compose custom pipes from `createBuiltInPipes('en-GB')`.

## Nullish values

- Built-in pipes preserve `null` and `undefined` values, so a later pipe, or the
  binding target, still sees them.
- `default` is the exception: it is there to replace a missing value. A path
  that does not resolve reads `undefined`, so `name | default:unknown` renders
  `unknown` when the model has no `name`, has `name: null`, or has `name: ''`.
- The binding target then decides what a nullish result means, as described in
  [Bindings][BND].

## Errors

- An unknown pipe throws.
- An exception thrown by a pipe propagates.

[BND]: Bindings.md
[DPF]: https://github.com/cure53/DOMPurify
