# ASLJS Data Binding AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-data-binding`.

This package provides declarative DOM binding through explicit
`data-bind-*` attributes and `bindDataModel(root, model, options?)`.

## Package Scope

Exports from `src/index.ts`:

- `bindDataModel`
- `createBuiltInPipes`
- `BindDataModelOptions`
- `DataModel`

Binding families described by the README:

- value bindings
- event bindings
- context bindings

## Preferred Usage Patterns

- Keep bindings explicit through `data-bind-*` attributes.
- Use `data-bind-context` to switch descendant binding roots instead of
  repeating long model paths.
- Keep value bindings path-based and pipe-based.
- Keep event bindings path-based and resolve actions from the model.
- Use multiple bindings on the same element when they represent distinct
  concerns.

## Constraints To Preserve

- Event bindings currently resolve a function and invoke it as
  `(event, model, element)`.
- Do not introduce expression-call syntax in binding attributes unless
  explicitly requested.
- Pipe arguments are static strings, not reactive model paths.
- `data-bind-context` rebinding must continue to dispose stale descendant
  watchers when context objects are replaced.
- Nullish behavior documented in the README is part of the contract:
  text/html render empty string, nullish attributes are removed.
- Missing or non-function event handlers warn and keep bindings alive.

## Validation

- `npm -w asljs-data-binding run test`
- `npm -w asljs-data-binding run typecheck`
- `npm -w asljs-data-binding run lint`

When changing binding syntax or runtime behavior, update `README.md` and this
file together.
