# Improvements For asljs-observable

This review answers two questions for `asljs-observable`.

The package already has good technical documentation. The main opportunity is
to make its reactive model easier for AI agents to understand correctly without
having to compare README examples, AGENTS guidance, and source behavior.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already provides strong local information:

- `README.md` explains objects, arrays, primitives, and `watch(...)`
- `AGENTS.md` explains preferred patterns and constraints
- `package.json` confirms the public package-root surface

That is a good start. The problem is that the package has several different
behavior modes, and AI has to infer when each one applies.

The main modes are:

- observing objects
- observing arrays
- observing primitive boxes
- watching property paths
- implementing explicit observable classes with `ObservableObject`

These are documented, but they are not yet organized as a simple decision map.

Suggested improvements:

### 1. Add a "choose this pattern when..." section

Add a short table to `AGENTS.md` and ideally also to `README.md`.

Example rows:

- plain object state: use `observable(object)`
- plain array state: use `observable(array)`
- primitive state box: use `observable(value)` and read/write `.value`
- reactive path reads: use `.watch(...)`
- class with explicit getter/setter control: use `ObservableObject`

Reasoning:

AI often understands what a package can do, but still guesses about which entry
pattern is the intended one for the current shape. A decision table reduces
that guesswork.

### 2. Add one explicit "public exports" section near the top of the README

The README is currently usage-first. Add a short list of exported runtime and
type-level symbols.

Reasoning:

AI should not have to infer exports from examples. If the package states its
public surface directly, the agent is less likely to invent imports or use
internal concepts that are not part of the stable surface.

### 3. Add a compact payload matrix

This package really needs a compact event payload table because the object,
array, and primitive cases differ in meaningful ways.

For example, a table could show:

- object `set` payload
- object `delete` payload
- object `define` payload
- array index change payload
- array property change payload
- primitive box payload

Reasoning:

This is one of the biggest error sources for AI. If the payload rules live only
in prose, the model may flatten them into one generic payload shape.

### 4. Add a "what `watch(...)` does not do" section

The README already notes that arrays are not supported by `watch(...)` and that
updates are observed only where an eventful segment exists. That should be made
more prominent.

Suggested explicit negatives:

- `watch(...)` does not support arrays as targets
- `watch(...)` is not a general query engine
- `watch(...)` does not magically observe non-eventful missing path segments
- nested updates depend on observable or eventful segments along the path

Reasoning:

Reactive APIs attract over-assumption. AI often maps them to broader frameworks
and assumes they do more than they actually do. A strong negative-boundary
section prevents that.

### 5. Add one "stable contract" section in AGENTS

List the behaviors that should be treated as public contract rather than loose
implementation detail.

Examples:

- specific events fire before generic ones
- `watch(...)` runs immediately
- `watch(...)` returns an unsubscribe function
- `shallow: true` affects only top-level conversion
- arrays are unsupported by `watch(...)`

Reasoning:

AI edits are safer when the package clearly marks which behaviors must be
preserved during refactors.

### 6. Add a package-local "edit safety" checklist

Suggested checklist:

- if touching payload shapes, re-check object, array, and primitive modes
- if touching `watch(...)`, re-check immediate callback behavior
- if touching deep conversion, re-check `shallow: true`
- if touching event ordering, re-check specific-before-generic semantics

Reasoning:

This package has subtle behavior interactions. A short checklist helps AI catch
the adjacent contract surfaces affected by one local change.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The package documentation is already useful, but discoverability is still a bit
too example-shaped.

Examples are important, but AI often needs one more layer above examples:

- a concept map
- a decision guide
- a contract summary
- a list of wrong assumptions to avoid

### Suggested improvements

### 1. Add a "concept model" section

Explain the package in one simple model:

- `observable(...)` turns values into eventful change-tracking containers
- objects, arrays, and primitives are observed differently
- `watch(...)` is for reactive reads of selected paths
- `ObservableObject` is for class-based explicit mutation control

Reasoning:

AI performs better when the package has a short high-level model before the
examples begin. That gives the model a mental frame for the rest of the file.

### 2. Add a "common wrong assumptions" section

This package is a strong candidate for that because reactive packages trigger a
lot of imported assumptions.

Good entries would be:

- this is not a virtual DOM or UI state framework
- `watch(...)` is not array-aware today
- deep observation is not the same as arbitrary deep magic
- payload shapes differ by target kind
- `ObservableObject` is not just a cosmetic wrapper around `observable(...)`

Reasoning:

AI errors often come from applying the mental model of MobX, Vue reactivity,
RxJS, or proxy-based framework systems. This package should state its own model
more sharply.

### 3. Add "related package" routing guidance

Add short routing notes like:

- for generic event APIs, see `asljs-eventful`
- for DOM binding built on observable paths, see `asljs-data-binding`
- for IndexedDB live views built on eventful and observable, see `asljs-dali`

Reasoning:

Good discoverability includes helping the AI stop at the right abstraction
level. Without routing guidance, the agent may try to solve DOM binding or data
storage problems directly in `observable`.

### 4. Add one complete realistic TypeScript example

The README has useful TypeScript examples, but a more complete example would be
helpful. It should show:

- typed observable object or class
- `watch(...)`
- at least one emitted payload
- one note about shape differences or limits

Reasoning:

AI often copies the richest example. A more realistic example reduces the chance
that it stitches together fragments incorrectly.

### 5. Add a glossary for package terms

Short definitions would help normalize meaning:

- observable value
- primitive box
- watched path
- eventful segment
- shallow conversion
- specific event
- generic event

Reasoning:

This package uses terms that are understandable, but AI still benefits when the
terms are explicitly defined and kept stable.

### 6. Add a discoverable "limitations" section near the top

Right now some limitations are present, but they are later in the README. Move
or repeat the most important ones near the top.

Important candidates:

- `watch(...)` does not support arrays
- nested watching depends on observable or eventful path segments
- object, array, and primitive payloads are intentionally different

Reasoning:

Agents usually scan from top to bottom and build an early mental model. The
most important limits should appear early, before the agent starts projecting
broader capabilities onto the package.

## Recommended first changes

If only a few changes are made, I would start here:

1. Add a pattern-selection table.
2. Add a payload-shape matrix.
3. Add a prominent `watch(...)` limitations section.
4. Add a common wrong assumptions section to `AGENTS.md`.

## Summary

`asljs-observable` is already documented well enough for a careful human
developer. The next step is to make the package easier for AI to read quickly
and safely.

The package should help an AI answer these questions immediately:

- which entry pattern should I use?
- what payload shape should I expect?
- what are the limits of `watch(...)`?
- what behaviors are stable contracts?
- when should I use a different package instead?

If those answers are made more explicit, AI agents will guess less, mix fewer
reactive models together, and produce more accurate usage and edits.
