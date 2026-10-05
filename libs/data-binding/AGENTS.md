# ASLJS Data Binding AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-data-binding`.

This package provides declarative DOM binding through explicit `data-bind-*`
attributes and `bindDataModel(root, model, options?)`.

The binding syntax, the binding families, the exports and the authoring rules
are in [Bindings][BND]; the pipes are in [Pipes][PIP]. This file adds only what
a change must preserve and how to check it.

## Constraints To Preserve

- Event bindings resolve a function and invoke it as `(event, model, element)`,
  with the object that holds the action as `this`, read when the event fires
  (`readModelPathOwner`).
- Do not introduce expression-call syntax in binding attributes unless
  explicitly requested.
- Pipe arguments are static strings, not reactive model paths.
- `data-bind-context` rebinding must continue to dispose stale descendant
  watchers when context objects are replaced.
- Nullish behavior is part of the contract: text/html render empty string,
  nullish attributes are removed.
- Missing or non-function event handlers warn and keep bindings alive.
- Event bindings are written `data-bind-on-<event>`, the same pattern as
  `data-bind-prop-<name>`. Any other `data-bind-on...` name, such as the earlier
  `data-bind-onclick`, warns and binds nothing; it must never fall through to an
  attribute binding, which would write an inline `on*` handler.
- Attribute names reach the binding lowercased. `data-bind-prop-<name>` converts
  `<name>` with the `dataset` rule (`read-only` to `readOnly`); event, attribute
  and class names are used as written, so hyphenated custom events such as
  `key-submit` stay bindable.
- Path subscriptions go through `watchModelPath` (`src/watch-model-path.ts`),
  which uses `observe(model).at(path)` for a model that conforms to the
  observable contract and binds a plain model once, statically. `observe()`
  throws for a non-conforming root, so the guard must stay.

## Change Safety Checklist

- If changing event binding, then re-check invocation shape `(event, model,
  element)` and the `this` of the call.
- If changing context behavior, then re-check stale watcher disposal.
- If changing nullish behavior, then re-check text, html, and attribute cases.
- If changing syntax parsing, then re-check quoted pipe arguments.
- If changing how binding names are read, then re-check `read-only` reaching
  `readOnly`, and `data-bind-on-key-submit` listening to `key-submit`.
- If changing value binding, then re-check that watch path subscriptions depend
  only on the main path.

## Validation

- `npm -w asljs-data-binding run test`
- `npm -w asljs-data-binding run typecheck`
- `npm -w asljs-data-binding run flint`

Update this file when AI-facing binding constraints, preserved runtime
contracts, or validation commands change. Update `docs/` when binding syntax or
pipe behavior changes, and `README.md` only when the landing-page usage changes.

[BND]: docs/Bindings.md
[PIP]: docs/Pipes.md
