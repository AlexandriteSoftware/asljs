# ASLJS Machine AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-machine`.

This package exports a state-machine factory. The behavioral contract is driven
by the package root exports and the implementation in `src/`. `REFERENCE.md`
holds the complete surface; `docs/Runtime Model.md` holds the runtime model.

## Package Scope

Root export:

- `machine(initial, definition?)`
- `machine(base, initial, definition?)`

Public types live in `src/types.ts` and are re-exported from `src/index.ts`:
`Machine`, `MachineState`, `MachineTransition`, `MachineDefinition`,
`MachineStateDefinition`, `MachineTargetDefinition`, `MachineGuard`,
`MachineStateOptions`, `MachineTransitionOptions`, `MachineTransitionPayload`,
`MachineRejectionPayload`, `MachineRejectReason`, `MachineData`,
`MachineEvents`, `MachineStateEvents`, `MachineTransitionEvents`.

## Files

- `src/types.ts` - types only, no runtime behavior.
- `src/machine.ts` - the factory and the declarative definition pass.
- `src/index.ts` - re-exports.
- `examples/document-agent.ts` - a folder-monitoring document agent whose whole
  control flow is one machine, with its own tests.

## Current Runtime Model

- The machine object is observable and eventful, with a typed event map.
- `machine.state` is the active state and `machine.previous` is the state left
  by the last successful transition. Both are observable.
- Transitions are named; `machine.send(name)` and `machine.go(target)` drive the
  machine without holding transition objects.
- `machine.can` and `machine.canGo` answer the same checks without changing
  state, guards included.
- Collections are exposed as copies through `getStates` and `getTransitions`.
- Injected methods are non-enumerable.
- Transitions are synchronous. The machine never awaits a listener.

## Constraints To Preserve

- `initial` must stay a required non-empty state name, validated before anything
  is built.
- State names stay unique when provided, and transition event names stay unique
  per state.
- Transitions can only target states already registered on the same machine.
- `machine.state` stays read-only in the public type.
- Activation refuses, and emits `rejected` with a reason, when:
  - the source state is not active (`not-active`),
  - another transition is running (`in-transition`),
  - the source state is final (`final`),
  - it is a self-transition without `reentry` (`self-transition`),
  - the guard returns false (`guard`).
- `send` refuses an unknown event name (`unknown-event`); `go` refuses an
  unresolvable target (`unknown-state`) and a target with no declared transition
  from the active state (`no-transition`).
- `rejected` is emitted on the transition first, when there is one, and then on
  the machine.
- Activation order is:
  - transition `activating`
  - source state `leaving`
  - machine `set:previous`
  - machine `set:state`
  - target state `entered`
  - transition `completed`
  - machine `transition`

Do not change that sequence silently, and do not make the reason list narrower.

## Preferred Change Patterns

- Keep the API small and explicit; the definition is plain data, so prefer
  extending the definition over adding new entry points.
- Prefer extending the existing state and transition objects over introducing
  new framework layers.
- Preserve the combination of `asljs-eventful` and `asljs-observable` unless a
  requested change explicitly replaces it.
- Keep the machine synchronous. If asynchronous transitions are requested, treat
  that as a new, separately documented capability rather than a change to
  `activate`.
- Guards run inside `can`, `canGo`, and `activate`, so they must stay free of
  side effects; document that wherever guards are described.

## What Not To Assume

- hierarchical statecharts are available
- parallel states are available
- transitions can target arbitrary foreign states
- self-transitions activate without `reentry`
- a final state can be left
- `machine.states` exists; it was replaced by `getStates()` in 0.3.0
- `machine.state` can be assigned

## Safe Usage Rules

- prefer a definition over imperative wiring
- name every transition that anything outside the machine has to trigger
- drive enablement from `can` and `canGo` rather than from separate flags
- subscribe to `rejected` when diagnosing a `false` return
- use `machine` for transition-driven control flow, not as a general app state
  store

## Change Safety Checklist

- If touching transition activation, then re-check every rejection reason and
  the activation event order.
- If touching machine state updates, then re-check the activation event order
  and the observable property names.
- If touching state names or registration, then re-check uniqueness behavior,
  `getState(name)`, and `go` by name.
- If touching the machine object shape, then re-check eventful and observable
  integration, and that injected methods stay non-enumerable.
- If touching the definition pass, then re-check final states, guards, reentry,
  and the unknown-target error.
- If touching anything in `src/`, then re-run the example tests: the agent in
  `examples/` exercises reentry, guards, final states, and rejection together.

## Related Packages

- If the task is really about generic events, move to `asljs-eventful`.
- If the task is really about observable property watching, move to
  `asljs-observable`.

## Validation

- `npm -w asljs-machine run build`
- `npm -w asljs-machine run test`
- `npm -w asljs-machine run typecheck`
- `npm -w asljs-machine run flint`
- `npm -w asljs-machine run example`

`build` compiles `src/` and `examples/` into `build/`, so `test` covers both.
`build:dist` compiles `src/` only, so examples never ship.

Update this file when AI-facing constraints, preserved transition semantics, or
validation commands change. Update `docs/Runtime Model.md` when user-facing
behavior changes, and `README.md` only when the landing-page usage changes.
