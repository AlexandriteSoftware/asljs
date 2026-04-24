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

## Validation

- `npm -w asljs-machine run build`
- `npm -w asljs-machine run test`
- `npm -w asljs-machine run typecheck`
- `npm -w asljs-machine run lint`

If public behavior expands, update `README.md` with examples and this file with
the preserved contract.
