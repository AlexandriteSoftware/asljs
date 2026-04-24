# Improvements For asljs-eventful

This review answers two questions for `asljs-eventful`.

The goal is not to redesign the package. The goal is to make the package easier
for AI agents to use correctly after reading only package-local information.

## 1. How to make it more suitable for an AI agent without looking for extra information?

Current situation:

The package already has useful material:

- `README.md` explains usage and options.
- `AGENTS.md` explains package scope, constraints, and validation commands.
- `package.json` makes the public package-root export clear.

This is already better than many packages. The problem is that an AI agent still
needs to combine information from more than one place before it feels safe.

For example, the agent must mentally combine:

- API examples from `README.md`
- behavioral constraints from `AGENTS.md`
- actual package surface from `package.json` and `src/index.ts`

That extra merging step increases guessing.

Suggested improvements:

### 1. Add a compact "AI quick reference" section to `AGENTS.md`

The current `AGENTS.md` is good, but it is still descriptive rather than highly
operational. Add a short structured block such as:

- main exports
- choose this API when...
- avoid this when...
- stable public behaviors
- common mistakes

Reasoning:

AI performs better when it has a short decision table instead of only prose.
This package has multiple valid entry patterns:

- `eventful(target)`
- `EventfulBase`
- construction-time enhancement

An AI agent benefits from a direct rule that says when each pattern should be
used.

### 2. Add a single explicit "preferred patterns" matrix

The README shows several styles, which is good for human readers, but it also
creates ambiguity for AI. Add a table like this:

- plain object: use `eventful(target)`
- existing class without inheritance freedom: use `eventful(this)` in the constructor
- new class hierarchy you control: use `EventfulBase`
- TypeScript class: declare eventful members using exported `Eventful<T>` types

Reasoning:

Right now, the examples are correct, but they are parallel examples, not a
selection guide. AI often sees parallel examples as equal choices and may pick
one that is technically valid but not the most suitable.

### 3. Add one explicit exported-surface list to the README

The `AGENTS.md` lists exports, but the README is still mostly example-driven.
Add a short "Public exports" section near the top of the README.

Reasoning:

If an AI reads only the README first, it should immediately know what symbols it
is allowed to use without inferring from examples.

### 4. Add a "do not assume" section

This package has important negative boundaries that are easy for AI to miss.
Document them explicitly:

- do not use DOM `EventTarget` terminology as if it were the same system
- do not invent event bubbling or capture semantics
- do not assume wildcard events
- do not assume listener return values drive control flow
- do not assume strict mode is the default

Reasoning:

AI often makes mistakes by filling in familiar patterns from other event
systems. The package becomes safer when those non-features are stated directly.

### 5. Add a minimal contract example for global `eventful` behavior

The README documents that `eventful` is also a global emitter. That is a very
important behavior because it is unusual. It should be highlighted in a short
"special behavior" section in both README and AGENTS.

Reasoning:

This is one of the behaviors most likely to be missed by AI, because it is not
the default expectation for a function that decorates objects. If that fact is
not prominent, an agent may refactor around it incorrectly.

### 6. Add one package-local checklist for change safety

Add a short checklist to `AGENTS.md`:

- if changing error behavior, check strict and non-strict flows
- if changing trace behavior, check global and instance trace paths
- if changing lifecycle events, preserve global emitter behavior
- if changing typing, preserve listener signatures in TypeScript examples

Reasoning:

AI is much less likely to miss important edge cases when a package gives a
short list of "if you touch X, also verify Y" rules.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

### Current situation

The package information is correct, but discoverability can still improve.

The largest issue is that the information is split by document purpose:

- README: examples and API
- AGENTS: constraints and AI guidance

That split is fine in principle, but the content is not yet shaped around the
questions an AI agent usually has.

Those questions are usually:

- what can I import?
- which usage pattern should I pick?
- what behaviors are stable and must not change?
- what does this package not do?
- what should I validate after editing?

### Suggested improvements

### 1. Put import examples right next to each major pattern

For each pattern, include a short block with:

- import line
- when to use it
- one minimal example

Reasoning:

AI is very sensitive to nearby examples. If the import statement, intended use,
and example are far apart, the model may blend them incorrectly.

### 2. Add a "stable behavior" section

Create a short explicit section listing behaviors that are public contract, not
just current implementation details.

For example:

- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, `has`
- `eventful` also acts as a global emitter
- strict mode propagates listener errors
- non-strict mode isolates listener errors through the configured error path
- `ListenerError` protects against recursive global error-loop failures

Reasoning:

AI makes fewer bad edits when it can distinguish between "example behavior" and
"must-preserve behavior".

### 3. Add a "common wrong assumptions" section

This package is a good candidate for that because event APIs trigger a lot of
familiar but wrong guesses.

Examples of good entries:

- this is not DOM `EventTarget`
- there is no documented event bubbling model
- listeners are not described as async middleware stages
- error handling is not the same in strict and non-strict mode

Reasoning:

A short list of common wrong assumptions often prevents more mistakes than a
longer general explanation.

### 4. Add a package-level glossary

Short definitions for terms used by the package would help:

- eventful target
- global emitter
- strict mode
- trace hook
- error hook
- `ListenerError`

Reasoning:

AI often works better when key terms are normalized. That reduces the chance of
mixing this package’s terms with similar concepts from other event libraries.

### 5. Add "most likely related package" links

At the end of the README and AGENTS, add a short note like:

- if you need property change tracking, see `asljs-observable`
- if you need DOM binding, see `asljs-data-binding`

Reasoning:

Discoverability is not only about this package itself. It is also about helping
the agent stop in the right package instead of forcing eventful to carry work
that belongs elsewhere.

This is especially useful in this monorepo because package layering is part of
the architecture.

### 6. Add one fully worked example that combines runtime and typing guidance

The README currently separates JavaScript and TypeScript examples. Add one
slightly more realistic TypeScript example with:

- event map type
- class or object enhancement
- subscription
- emit
- error or strict configuration if relevant

Reasoning:

AI often copies the most complete example. A stronger realistic example reduces
the chance that the agent assembles fragments from several sections and creates
a slightly wrong result.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Add a pattern-selection matrix to `README.md`.
2. Add a "do not assume" section to `AGENTS.md`.
3. Add a stable-behavior contract section to both files.
4. Add a small change-safety checklist to `AGENTS.md`.

## Summary

`asljs-eventful` already has solid documentation. The next improvement is not
more volume. It is better AI-oriented structure.

The package should help an AI answer these questions immediately:

- what can I import?
- which pattern should I choose?
- what must not change?
- what common assumptions are wrong here?
- what else should I validate if I edit this behavior?

If those answers are made explicit, AI agents will guess less, make fewer wrong
API assumptions, and use the package more consistently.
