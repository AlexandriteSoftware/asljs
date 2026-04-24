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

Binding families in this package:

- value bindings
- event bindings
- context bindings

## AI Quick Reference

Binding contract at a glance:

- value bindings are path-based
- event bindings are path-based
- context bindings switch subtree model roots
- pipe args are static strings
- event actions are invoked as `(event, model, element)`
- missing actions warn instead of crashing the whole binding system

Choose this binding family when:

- you need text output -> `data-bind-text`
- you need HTML output -> `data-bind-html`
- you need an attribute value -> `data-bind-<attr>`
- you need a DOM property -> `data-bind-prop-<name>`
- you need a class toggle -> `data-bind-class-<name>`
- you need an event handler -> `data-bind-on<event>`
- you need a subtree context switch -> `data-bind-context`

Unsupported syntax:

- no inline function-call expressions like `save(item.id)`
- no computed expressions like `price * qty`
- no reactive pipe arguments
- no template-language control structures inside attributes
- no implicit two-way binding syntax

## Preferred Usage Patterns

- Keep bindings explicit through `data-bind-*` attributes.
- Use `data-bind-context` to switch descendant binding roots instead of
  repeating long model paths.
- Keep value bindings path-based and pipe-based.
- Keep event bindings path-based and resolve actions from the model.
- Use multiple bindings on the same element when they represent distinct
  concerns.

## Common Wrong Assumptions

- this is a general expression language
- binding attributes support arbitrary JavaScript
- event bindings resolve inline calls instead of model paths
- pipe arguments are reactive values
- reactivity comes from automatic dependency tracking instead of watched paths

## Constraints To Preserve

- Event bindings currently resolve a function and invoke it as
  `(event, model, element)`.
- Do not introduce expression-call syntax in binding attributes unless
  explicitly requested.
- Pipe arguments are static strings, not reactive model paths.
- `data-bind-context` rebinding must continue to dispose stale descendant
  watchers when context objects are replaced.
- Nullish behavior is part of the contract:
  text/html render empty string, nullish attributes are removed.
- Missing or non-function event handlers warn and keep bindings alive.

## Safe Authoring Rules

- keep each binding attribute focused on one concern
- prefer multiple binding attributes over overloaded single expressions
- use `data-bind-context` instead of repeating long nested paths
- keep handler names on the model
- keep pipe args literal unless a custom pipe expects string args

## Change Safety Checklist

- If changing event binding, then re-check invocation shape `(event, model,
  element)`.
- If changing context behavior, then re-check stale watcher disposal.
- If changing nullish behavior, then re-check text, html, and attribute cases.
- If changing syntax parsing, then re-check quoted pipe arguments.
- If changing value binding, then re-check that watch path subscriptions depend
  only on the main path.

## Related Packages

- If the task is really about model reactivity, move to `asljs-observable`.
- If the task is really about event primitives, move to `asljs-eventful`.
- If the task is really about reusable UI elements, move to
  `asljs-components`.

## Validation

- `npm -w asljs-data-binding run test`
- `npm -w asljs-data-binding run typecheck`
- `npm -w asljs-data-binding run lint`

Update this file when AI-facing binding constraints, preserved runtime
contracts, or validation commands change. Update `README.md` separately only
when user-facing binding usage or behavior changes.
