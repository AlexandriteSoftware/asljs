# data-binding-safehtml-is-identity

The built-in `safeHtml` pipe returns its input unchanged, and nothing says so.

Package: `data-binding`.

`createBuiltInPipes` defines `safeHtml: value => value`. `README.md` lists it
among the built-ins and uses it in an example, `<div data-bind-html="body |
safeHtml"></div>`, with no description. A reader takes the name as a promise:
that the pipe sanitises, or at least that `data-bind-html` without it is somehow
guarded. Neither is true. `writeBindingValue` assigns `innerHTML` directly, with
or without the pipe, and the pipe neither escapes nor strips anything.

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

- `libs/data-binding/src/pipes.ts` - `safeHtml` in `createBuiltInPipes`.
- `libs/data-binding/src/write-binding-value.ts` - the `html` branch.
- `libs/data-binding/README.md` - "Built-ins" and the `safeHtml` example.
