# data-binding-safehtml-is-identity

The built-in `safeHtml` pipe returns its input unchanged, and nothing says so.

Package: `data-binding`.

## Context

A value binding such as `data-bind-html="body | safeHtml"` runs, in call order:

- `bindValueModel` reads `body` from the model with `readModelPath`.
- It applies the pipes in order; each pipe is looked up in the registry from
  `mergePipes(options)`, which is `createBuiltInPipes()` plus user pipes, user
  pipes winning on name.
- `writeBindingValue` writes the result. For `data-bind-html` the target kind is
  `html`, and the value is converted with `coerceDisplayValue` (nullish to `''`,
  `Date` to ISO, otherwise `String()`) and assigned to `innerHTML`.

`libs/data-binding/src/pipes.ts` - the last entry of `createBuiltInPipes`:

```ts
safeHtml: value => value };
```

`libs/data-binding/src/write-binding-value.ts`:

```ts
  const displayValue =
    coerceDisplayValue(value);

  if (target.kind === 'html') {
    element.innerHTML = displayValue;

    return;
  }
```

## Problem

`createBuiltInPipes` defines `safeHtml: value => value`. `docs/Pipes.md` lists
it under "Built-ins" with no description, and `docs/Bindings.md` uses it in an
example under "Value bindings", `<div data-bind-html="body | safeHtml"></div>`.
A reader takes the name as a promise: that the pipe sanitises, or at least that
`data-bind-html` without it is somehow guarded. Neither is true.
`writeBindingValue` assigns `innerHTML` directly, with or without the pipe, and
the pipe neither escapes nor strips anything.

The pattern the name comes from, a marker that tells a template engine "this
string is already safe, do not escape it", does not apply here because the html
target never escapes in the first place. So the pipe has no effect on rendering
and a misleading name, and the one place a user might look for the rule,
"Built-ins", does not state what `data-bind-html` does with untrusted input.

Proposed behaviour: either remove `safeHtml`, or document it as a no-op marker
kept for readability and say in the same paragraph that `data-bind-html` writes
raw markup and the caller is responsible for sanitising. A built-in `escape`
pipe (HTML-escape for use with `data-bind-html`) would be a more useful thing to
ship under a name that says what it does.

## Where

- `libs/data-binding/src/pipes.ts` - `safeHtml` in `createBuiltInPipes`, and the
  built-ins list in its doc comment.
- `libs/data-binding/src/write-binding-value.ts` - the `html` branch.
- `libs/data-binding/docs/Pipes.md` - "Built-ins".
- `libs/data-binding/docs/Bindings.md` - "Value bindings", the `safeHtml`
  example.
