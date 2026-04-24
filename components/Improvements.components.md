# Improvements For asljs-components

This review answers two questions for `asljs-components`.

This package is small in API surface, but that does not automatically make it
easy for AI. In fact, small UI packages are often easy for AI to misuse because
the model fills in missing behavior from other component systems.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already has a lot of useful information:

- `README.md` explains `asljs-list`
- `AGENTS.md` explains package constraints
- `AI.md` also explains AI-facing behavior
- `package.json` confirms the package-root surface

The main problem is not missing information. The main problem is duplicated AI
information across `AGENTS.md` and `AI.md`.

That duplication increases drift risk. It also makes AI routing less clear,
because the package has more than one AI-facing source.

Suggested improvements:

### 1. Pick one canonical AI-facing package file

This package should not require an agent to decide whether `AGENTS.md` or
`AI.md` is the real source of truth.

Recommended rule:

- use `AGENTS.md` as the canonical AI-facing guide
- remove `AI.md`, or reduce it to a short pointer to `AGENTS.md`

Reasoning:

When the same package rules exist in two files, AI gets inconsistent discovery.
Even if the content is currently aligned, long-term maintenance becomes fragile.

### 2. Add a "component contract at a glance" section

This package currently exposes one main component, which makes a compact
contract summary very practical.

The section should answer these questions immediately:

- what do I import?
- what custom element becomes available?
- which templates are required?
- which templates are optional?
- what context fields exist in row bindings?

Reasoning:

AI should not have to scan several sections to build the mental model of
`asljs-list`. A short contract block would make the package much easier to use
correctly from one read.

### 3. Add an explicit "when to use this package" section

The package should say something like:

- use `asljs-components` when you want reusable web components already designed
  for ASLJS patterns
- use `asljs-data-binding` directly when you only need DOM binding without a
  packaged component

Reasoning:

AI often overuses UI packages. Clear scope guidance helps the model stop at the
right abstraction level.

### 4. Add a very explicit "how row actions get row data" section

This is one of the most important package behaviors.

The docs should say clearly:

- handlers should usually be referenced as `context.someAction`
- row-specific state arrives through the derived `this` context
- do not invent inline argument syntax like `select(item.id)`

Reasoning:

This is a prime AI error point. Many models naturally try to pass row data as
inline function-call arguments. This package intentionally does not work that
way.

### 5. Add a short "what not to change casually" checklist

Suggested checklist:

- keep row rendering template-driven
- preserve `[data-role="items"]` as the container insertion point
- preserve the row context field names
- preserve path-based binding integration with `asljs-data-binding`
- preserve observable/eventful collection rerender behavior

Reasoning:

This package is small enough that a short checklist would cover most of the
important contract surface.

### 6. Add one end-to-end minimal example in one place only

The package should have one canonical example that includes:

- import
- element creation
- `list.context`
- item template
- optional empty or container template
- `list.items`

Reasoning:

AI usually copies the most complete example. One canonical example reduces the
chance of partial or mixed usage patterns.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The current package information is useful, but it still leaves room for AI to
import assumptions from other UI systems.

Typical wrong assumptions here would be:

- assuming inline event expression syntax
- assuming component props are the main configuration surface
- assuming rows are rendered by imperative callbacks instead of templates
- assuming any container template shape is acceptable

### Suggested improvements

### 1. Add a "common wrong assumptions" section

Good entries would be:

- this is not React-style callback rendering
- this is not template-expression syntax with inline function calls
- row actions should not pass arguments in attributes
- the container slot must contain `[data-role="items"]`
- item rendering stays declarative through templates

Reasoning:

This package lives near several common UI patterns that are similar but not the
same. AI needs explicit boundaries so it does not generate code from the wrong
mental model.

### 2. Add a structured row-context reference block

The docs already list row context fields. Make the list more operational by
adding a short definition for each field and a note about when it is useful.

For example:

- `item`: current row record
- `index`: zero-based row index
- `first` / `last`: boundary flags
- `odd` / `even`: parity flags
- `count`: total item count
- `context`: shared base context adapted to the row

Reasoning:

AI is less likely to misuse context fields when their meanings are explicit and
adjacent to usage guidance.

### 3. Add package routing guidance to neighboring packages

Examples:

- for generic DOM binding rules, see `asljs-data-binding`
- for state reactivity, see `asljs-observable`
- for event primitives, see `asljs-eventful`

Reasoning:

Discoverability improves when the package states where neighboring concerns
belong. This helps AI avoid putting too much behavior into the component layer.

### 4. Add a "configuration surface" section

Explain in one visible place that the main configuration surface is:

- `list.items`
- `list.context`
- child templates through data slots

Reasoning:

AI often looks for props, callback options, or render functions by default. The
package should tell it clearly what the actual configuration model is.

### 5. Add a limitations section near the top

Important limits to state clearly:

- only documented slots are supported
- item rendering depends on templates, not imperative row callbacks
- event integration follows `asljs-data-binding` path-based handler rules

Reasoning:

This kind of package is easy to over-assume. Early limitations improve the
agent’s first mental model and reduce later mistakes.

### 6. Add a "safe authoring rules" section for generated markup

This should tell an AI writing usage code what to do.

For example:

- keep row templates declarative
- use `context` methods for shared row actions
- avoid custom attribute protocols
- do not mutate slot templates at runtime
- update `list.items` or the source collection instead of rewriting row DOM

Reasoning:

This package is often going to be used by AI in app code, not only edited in
its own source. Usage guidance is therefore especially important.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Make `AGENTS.md` the single canonical AI file and retire `AI.md`.
2. Add a compact component contract summary.
3. Add a common wrong assumptions section.
4. Add a stronger explanation of row-action context and why inline arguments are
   not the model.

## Summary

`asljs-components` does not mainly need more content. It needs clearer AI
ownership of its guidance and sharper boundaries around how `asljs-list` works.

The package should help an AI answer these questions immediately:

- what is the real AI source of truth for this package?
- how is `asljs-list` configured?
- how do row actions receive row data?
- what slot structure is required?
- what common UI assumptions are wrong here?

If those answers become easier to scan, AI agents will guess less, generate
cleaner usage code, and make fewer template-contract mistakes.
