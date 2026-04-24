# Improvements For asljs-data-binding

This review answers two questions for `asljs-data-binding`.

This package is already documented better than many DOM binding libraries. The
main improvement area is reducing the chance that AI agents invent extra binding
features or import assumptions from other template systems.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already has strong package-local information:

- `README.md` explains binding families, syntax, runtime behavior, and nullish
  handling
- `AGENTS.md` captures important constraints for AI-driven changes
- `package.json` confirms the package-root public surface

That is a strong base. The main issue is that this package lives in a problem
space where AI often overgeneralizes.

AI frequently assumes features from other binding systems, such as:

- arbitrary expressions inside binding attributes
- function calls with inline arguments
- reactive pipe arguments
- implicit event parameter conventions from frameworks
- magical two-way binding

The current docs say what the package does. They could do more to say what it
does not do.

Suggested improvements:

### 1. Add a "binding contract at a glance" section to `AGENTS.md`

This should be a short structured summary of the core rules:

- value bindings are path-based
- event bindings are path-based
- context bindings switch subtree model roots
- pipe args are static strings
- event actions are invoked as `(event, model, element)`
- missing actions warn instead of crashing the whole binding system

Reasoning:

AI often performs best when the most important rules are presented as a compact
contract block, not only explained inside longer sections.

### 2. Add an explicit "unsupported syntax" section

This should be prominent in both README and AGENTS.

Examples of good entries:

- no inline function-call expressions like `save(item.id)`
- no computed expressions like `price * qty`
- no reactive pipe arguments
- no template-language control structures inside attributes
- no implicit two-way binding syntax

Reasoning:

This is probably the single biggest improvement for AI safety in this package.
Most incorrect AI outputs in binding libraries come from invented syntax.

### 3. Add a "choose the right binding family" table

Add a small decision guide:

- write text: `data-bind-text`
- write html: `data-bind-html`
- write attribute: `data-bind-<attr>`
- write DOM property: `data-bind-prop-<name>`
- toggle class: `data-bind-class-<name>`
- handle event: `data-bind-on<event>`
- change descendant root: `data-bind-context`

Reasoning:

The README already describes the families, but a decision table would help AI
choose faster and with fewer wrong detours.

### 4. Add a small "public exports" section near the top of the README

List the exported runtime surface and the main types directly.

Reasoning:

This package has a fairly small API, which is good. Because it is small, it is
worth making the full public surface immediately visible so AI does not infer
hidden helpers or unsupported entry points.

### 5. Add a package-local change-safety checklist

Suggested checklist:

- if changing event binding, re-check invocation shape `(event, model, element)`
- if changing context behavior, re-check stale watcher disposal
- if changing nullish behavior, re-check text, html, and attribute cases
- if changing syntax parsing, re-check quoted pipe arguments
- if changing value binding, re-check watch path subscriptions only depend on
  the main path

Reasoning:

This package has several subtle behaviors that can be broken by changes that
look small. AI benefits from a list of nearby contracts to verify.

### 6. Add one fully worked example that combines all three binding families

The current README examples are good but somewhat separated by topic. Add one
complete example that includes:

- a model
- `data-bind-context`
- value bindings
- an event binding
- at least one custom pipe

Reasoning:

AI often copies the richest example. One strong end-to-end example reduces the
chance of assembling a partially wrong pattern from several smaller examples.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The information is already accurate, but it is still somewhat distributed by
topic instead of by agent decision need.

An AI agent usually wants to answer these questions quickly:

- what syntax is valid?
- what syntax is invalid?
- which binding type should I use?
- what happens when values are nullish?
- what does the event handler receive?
- where should I use another package instead?

### Suggested improvements

### 1. Add a "common wrong assumptions" section

This should be explicit and short.

Good candidates:

- this is not a general expression language
- attributes do not support arbitrary JavaScript
- event bindings resolve model paths, not inline calls
- pipe arguments are static text
- reactivity follows watched model paths, not automatic dependency tracking

Reasoning:

This package is especially vulnerable to framework contamination. AI models have
seen many template languages and tend to merge them unless the package draws a
hard boundary.

### 2. Add a syntax grammar summary

The README already explains syntax in prose. Add a compact grammar-style block
for each family.

Examples:

- `data-bind-text="path[ | pipe[:arg...]]*"`
- `data-bind-onclick="actionPath"`
- `data-bind-context="path"`

Reasoning:

Grammar-style summaries are very useful for AI because they reduce the need to
infer syntax from examples.

### 3. Add a "behavior matrix" for nullish values and errors

Create a table covering:

- text target with nullish value
- html target with nullish value
- attribute target with nullish value
- unknown pipe
- pipe exception
- missing event handler
- non-function event handler

Reasoning:

AI agents often guess fallback behavior when it is not placed in one visible
table. A matrix makes this package much easier to use correctly.

### 4. Add cross-package routing guidance

Add short notes that explain when this package is not the correct destination.

Examples:

- for model reactivity itself, see `asljs-observable`
- for event primitives, see `asljs-eventful`
- for reusable UI elements, see `asljs-components`

Reasoning:

Discoverability improves when the package tells the AI what neighboring package
solves the next layer of the problem. That helps agents avoid overloading
`data-binding` with responsibilities that belong elsewhere.

### 5. Add a glossary of package terms

Useful terms to define:

- binding target
- action path
- pipe
- context binding
- descendant context
- nullish behavior
- stale watcher

Reasoning:

AI becomes more consistent when package vocabulary is explicit and stable.

### 6. Add a short "safe authoring rules" section for markup writers

This should tell an AI writing HTML what rules to follow.

For example:

- keep each attribute focused on one concern
- prefer multiple binding attributes over overloaded single expressions
- use `data-bind-context` instead of repeating long nested paths
- keep event handler names on the model
- keep pipe arguments literal unless a custom pipe is intentionally designed for
  string arguments

Reasoning:

AI often writes usage code more often than it edits the library itself. This
kind of authoring guidance improves discoverability and output quality at the
point of use.

## Recommended first changes

If only a few improvements are made, I would do these first:

1. Add an unsupported-syntax section.
2. Add a compact binding-contract summary.
3. Add a binding-family decision table.
4. Add a nullish-and-error behavior matrix.

## Summary

`asljs-data-binding` already explains the happy path well. The next improvement
is to make the boundaries and non-features much more explicit.

This package should help an AI answer these questions immediately:

- which binding form is valid here?
- which shortcuts are not supported?
- what does the handler receive?
- what happens on nullish values or missing handlers?
- when should I use another package instead?

If those answers are made easier to scan, AI agents will invent less syntax,
guess less about behavior, and use the binding system more consistently.
