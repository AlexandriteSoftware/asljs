# Improvements For asljs-machine

This review answers two questions for `asljs-machine`.

This package has a small public surface, which is good. Right now, however, the
package is easier for AI to understand from `AGENTS.md` than from `README.md`.
That means an AI agent may still need to rely on extra files or source reading
to feel safe.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package has:

- a minimal `README.md`
- a much more detailed `AGENTS.md`
- a clear `package.json` public boundary

This creates an imbalance.

The README says very little beyond the package name and general purpose, while
the AGENTS file contains most of the actual behavioral contract:

- public exports
- runtime model
- activation failure cases
- transition event order

That means an AI that starts from the README does not get enough usable package
knowledge.

Suggested improvements:

### 1. Expand the README into a real package guide

This is the most important improvement for this package.

The README should include at least:

- what `machine(...)` returns
- how states are created
- how transitions are created
- what the active state is
- which events are emitted during transitions
- what failure cases exist

Reasoning:

For this package, the main issue is not ambiguity between many docs. It is that
the human-facing primary doc is too thin. That forces AI to look elsewhere.

### 2. Add one canonical usage example

The package needs a concrete example showing:

- machine creation
- state creation
- transition creation
- transition activation
- observing the result

Reasoning:

AI often copies the first complete example it finds. Right now there is no
package-local README example to anchor usage.

### 3. Add a "public contract at a glance" section

This should be a short block near the top of README and AGENTS that answers:

- root export: `machine(base, initial)`
- public types: `Machine`, `MachineState`, `MachineTransition`
- machine is both eventful and observable
- transitions have defined activation guards and event order

Reasoning:

This package is small enough that one short contract block can cover most of the
important information an AI needs.

### 4. Add an explicit "state machine model" section

The docs should state the model plainly:

- a machine has registered states
- one state is current at a time
- transitions belong to a source state and target a state on the same machine
- activation moves the machine through a specific event order

Reasoning:

AI has seen many state-machine libraries with very different models. This
package needs to define its model explicitly so the agent does not import a
different framework’s ideas.

### 5. Add a "what not to assume" section

Examples:

- do not assume hierarchical statecharts
- do not assume parallel states
- do not assume transition guards or actions beyond what is documented
- do not assume self-transitions succeed
- do not assume arbitrary transition targets outside the same machine

Reasoning:

This package name naturally triggers assumptions from richer state-machine
libraries. Clear non-goals would prevent a lot of wrong guesses.

### 6. Add a short change-safety checklist

Suggested checklist:

- if touching transition activation, re-check failure cases
- if touching machine state changes, re-check event ordering
- if touching names or registration, re-check uniqueness behavior
- if touching the machine object shape, re-check observable and eventful
  integration

Reasoning:

The package is small, so a short checklist would be cheap and high value.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The current package information is accurate but incomplete from a discoverability
point of view.

The strongest facts are in `AGENTS.md`, not in `README.md`. That means an AI may
understand the package only after reading the AI file, not after reading the
package docs themselves.

### Suggested improvements

### 1. Put the runtime model into the README, not only AGENTS

The README should directly document:

- `machine.state`
- `machine.states`
- `machine.createState(name?)`
- `state.createTransition(to)`
- `machine.getState(name)`

Reasoning:

These are the practical usage hooks. If they are not in the README, AI has to
infer usage from source or from the AGENTS file.

### 2. Add a "common wrong assumptions" section

Good entries would be:

- this is not a hierarchical statechart framework
- this is not an actor model
- transitions do not target arbitrary foreign states
- self-transitions do not currently activate successfully
- transition event order is part of current contract

Reasoning:

Because the package name is generic, AI will often import assumptions from XState
or other more feature-rich machine libraries unless the package draws stronger
boundaries.

### 3. Add a small event-order reference block

The current AGENTS file already lists activation order. That should also be in
the README, ideally in a compact numbered list or table.

Reasoning:

Event ordering is one of the most important behavioral contracts in this
package. It should be easy to discover without reading AI-only guidance.

### 4. Add a glossary for package terms

Useful terms to define:

- machine
- state
- transition
- active state
- source state
- target state
- activation

Reasoning:

The concepts are simple, but AI still benefits from vocabulary being normalized
and tied to this package’s exact model.

### 5. Add routing guidance to neighboring packages

Examples:

- for generic events, see `asljs-eventful`
- for observable property watching, see `asljs-observable`
- use `machine` for control-flow state transitions, not as a general app state
  store

Reasoning:

This helps discoverability and also prevents overloading the package with
broader responsibilities than intended.

### 6. Add a "safe usage rules" section

This should guide AI when using the package in app code.

Examples:

- create states first, then connect transitions
- use named states when discoverability matters
- check transition activation result when flow depends on it
- do not describe undocumented advanced machine features as available

Reasoning:

AI often uses a package more often than it edits the package source. Safe usage
rules help produce better downstream code.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Expand `README.md` with a real usage example and runtime model.
2. Move the activation-order contract into the README.
3. Add a common wrong assumptions section.
4. Add a small public-contract summary near the top.

## Summary

`asljs-machine` already has useful AI guidance, but the package README is too
thin to act as a complete local source of truth.

The package should help an AI answer these questions immediately:

- what is the public API?
- how do I create and connect states?
- what happens during activation?
- which machine features are not part of this package?
- what neighboring package should I use for other concerns?

If those answers are added directly to the package docs, AI agents will need to
guess less, infer less from source, and use the package much more accurately.
