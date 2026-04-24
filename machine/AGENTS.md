# ASLJS Machine AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-machine`.

This package exports a compact state-machine constructor. The implementation is
small and its behavioral contract is driven by the package root exports and the
implementation in `src/`.

## Package Scope

Root export:

- `machine(base, initial)`

Public types:

- `Machine`
- `MachineState`
- `MachineTransition`

## Current Runtime Model

- The machine object is observable and eventful.
- `machine.state` holds the current state object.
- `machine.states` is the created state list.
- `machine.createState(name?)` creates and registers a state.
- `state.createTransition(to)` creates a transition owned by that state.
- `machine.getState(name)` returns a state or `null`.

## Constraints To Preserve

- `initial` is required and must remain a string-based initial state name.
- State names must stay unique when provided.
- Transitions can only target states already registered on the same machine.
- A transition activation currently returns `false` when:
  - the source state is not active,
  - another transition is already running,
  - the transition would be a self-transition.
- Activation order currently is:
  - transition `activating`
  - source state `leaving`
  - machine state update
  - target state `entered`
  - transition `completed`
  - machine `transition`

Do not change that sequence silently.

## Preferred Change Patterns

- Keep the API small and explicit.
- Prefer extending the existing state/transition objects over introducing new
  framework layers.
- Preserve the combination of `asljs-eventful` and `asljs-observable` unless a
  requested change explicitly replaces it.

## What Not To Assume

- hierarchical statecharts are available
- parallel states are available
- transitions can target arbitrary foreign states
- self-transitions activate successfully
- undocumented guard or action systems exist

## Safe Usage Rules

- create states first, then connect transitions
- use named states when discoverability matters
- check activation results when later logic depends on success
- use `machine` for transition-driven control flow, not as a general app state
  store

## Change Safety Checklist

- If touching transition activation, then re-check all documented failure
  cases.
- If touching machine state updates, then re-check the activation event order.
- If touching state names or registration, then re-check uniqueness behavior
  and `getState(name)`.
- If touching the machine object shape, then re-check eventful and observable
  integration.

## Related Packages

- If the task is really about generic events, move to `asljs-eventful`.
- If the task is really about observable property watching, move to
  `asljs-observable`.

## Validation

- `npm -w asljs-machine run build`
- `npm -w asljs-machine run test`
- `npm -w asljs-machine run typecheck`
- `npm -w asljs-machine run lint`

Update this file when AI-facing constraints, preserved transition semantics, or
validation commands change. Update `README.md` separately only when
user-facing behavior or examples change.
