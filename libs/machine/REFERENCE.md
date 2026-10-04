# REFERENCE

Complete surface of `asljs-machine`. See `docs/Runtime Model.md` for the runtime
model and `examples/` for a worked use.

## machine(initial, definition?)

Creates a machine whose active state is `initial`.

- `initial`: non-empty state name. Anything else throws.
- `definition`: optional `MachineDefinition`. A non-object throws.

## machine(base, initial, definition?)

Same, with `base` extended in place of a new object. The result is `base &
Machine`. Base properties stay enumerable and observable; machine methods are
non-enumerable.

## Machine

- `state: MachineState` - the active state. Read-only; use `send` or `go`.
- `previous: MachineState | null` - the state left by the last successful
  transition.
- `getStates(): MachineState[]` - copy of the registered states, in creation
  order.
- `getState(name): MachineState | null`
- `createState(name?, options?): MachineState` - throws when `name` is already
  used.
- `can(event): boolean` - whether `send(event)` would succeed, guard included.
- `send(event): boolean` - fires the active state's transition with that name.
- `canGo(target): boolean` - whether `go(target)` would succeed.
- `go(target): boolean` - fires the active state's transition leading to
  `target`, given as a state name or a state of this machine.
- `watch(property, callback): () => boolean` - from `asljs-observable`. Reports
  the current value first, then every change.
- the `asljs-eventful` API: `on`, `once`, `off`, `emit`, `emitAsync`, `has`,
  `getListeners`, `removeAllListeners`.

### Machine events

- `transition: [MachineTransitionPayload]` - a transition completed.
- `rejected: [MachineRejectionPayload]` - a transition was refused.
- `set:state`, `set:previous`, `set`, `delete`, `define`, and their keyed forms,
  from `asljs-observable`.

## MachineState

- `name: string | undefined`
- `final: boolean` - a final state is never left; every transition out of it is
  refused with reason `final`.
- `machine: Machine`
- `getTransitions(): MachineTransition[]` - copy, in creation order.
- `getTransition(event): MachineTransition | null`
- `createTransition(to, options?): MachineTransition` - throws when `to` belongs
  to another machine, or when `options.name` is already used on this state.
- the `asljs-eventful` API.

### State events

- `entered: [MachineTransitionPayload]`
- `leaving: [MachineTransitionPayload]`

## MachineTransition

- `name: string | undefined` - the event name `send` matches.
- `from`, `to`, `machine`
- `can(): boolean`
- `activate(): boolean`
- the `asljs-eventful` API.

### Transition events

- `activating: [MachineTransitionPayload]`
- `completed: [MachineTransitionPayload]`
- `rejected: [MachineRejectionPayload]`

## Options

`MachineStateOptions`:

- `final?: boolean`

`MachineTransitionOptions`:

- `name?: string` - event name for `send`.
- `when?: MachineGuard` - guard.
- `reentry?: boolean` - allow source and target to be the same state.

## Definition

```ts
type MachineDefinition = Record<string, MachineStateDefinition | null>;

type MachineStateDefinition = Record<string, string | MachineTargetDefinition>;

interface MachineTargetDefinition
{
  to: string;
  when?: MachineGuard;
  reentry?: boolean;
}
```

- Key of the outer record: state name. `null` value: final state.
- Key of the inner record: event name. String value: target state name.

## Payloads

`MachineTransitionPayload`:

- `event: string | undefined`
- `from: MachineState`
- `to: MachineState`
- `machine: Machine`
- `transition: MachineTransition`

`MachineRejectionPayload`:

- `reason: MachineRejectReason`
- `event: string | undefined` - undefined for `go` and `activate`
- `from: MachineState` - the active state at the time of the call
- `to: MachineState | null` - null when the target could not be resolved
- `machine: Machine`
- `transition: MachineTransition | null` - null when no transition was found

`MachineRejectReason`: `unknown-event`, `unknown-state`, `no-transition`,
`not-active`, `in-transition`, `final`, `self-transition`, `guard`.

## Errors

The factory and the builders throw, rather than reject, on programming errors:

- `initial` is not a non-empty string
- `definition` is not an object
- a definition transition targets an unknown state
- a state name is already used
- a transition event name is already used on that state
- `createTransition` targets a state of another machine

Everything that depends on runtime conditions is a rejection instead.
