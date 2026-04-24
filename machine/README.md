# machine

> Part of [Alexandrite Software Library][#1] - a set of high-quality and
performant JavaScript libraries for everyday use.

State machine library for JavaScript.

## Public Contract At A Glance

- Root export: `machine(base, initial)`
- Public types: `Machine`, `MachineState`, `MachineTransition`
- A machine is both eventful and observable.
- One state is active at a time through `machine.state`.
- States are registered on `machine.states`.
- Transition activation has defined failure cases and event order.

## Runtime Model

- `machine(base, initial)` returns the base object extended with machine
  behavior.
- `machine.state` holds the current active state.
- `machine.states` holds the registered states.
- `machine.createState(name?)` creates and registers a state.
- `state.createTransition(to)` creates a transition from that state to another
  state on the same machine.
- `machine.getState(name)` returns a state or `null`.

## Safe Usage Rules

- Create states before wiring transitions to them.
- Use named states when readability or lookup matters.
- Check `transition.activate()` when downstream flow depends on success.
- Use this package for control-flow state transitions, not as a general app
  state store.

## Canonical Example

```js
import { machine } from 'asljs-machine';

const workflow =
  machine({ label: 'editor' }, 'idle');

const selected =
  workflow.createState('selected');

const select =
  workflow.state.createTransition(selected);

workflow.on(
  'set:state',
  ({ value }) => {
    console.log('active state:', value.name);
  });

select.on(
  'activating',
  ({ from, to }) => {
    console.log('transition:', from.name, '->', to.name);
  });

const activated =
  select.activate();

console.log(activated); // true
console.log(workflow.state.name); // 'selected'
```

## Transition Activation

Activation succeeds only when all of the following are true:

- the transition source state is currently active
- another transition is not already running
- the target is not the same as the source state

Activation returns `false` when any of those checks fail.

## Event Order

When activation succeeds, the current contract order is:

1. transition `activating`
2. source state `leaving`
3. machine observable state update
4. target state `entered`
5. transition `completed`
6. machine `transition`

The machine state update is observable, so listeners like `set:state` run as
part of the transition flow.

## What Not To Assume

- Do not assume hierarchical statecharts.
- Do not assume parallel states.
- Do not assume transition guards or actions beyond the documented behavior.
- Do not assume self-transitions activate successfully.
- Do not assume transitions can target states from another machine.

## Related Packages

- For generic event APIs, see `asljs-eventful`.
- For observable property watching, see `asljs-observable`.
- Use `asljs-machine` for transition-based control flow rather than as a
  general-purpose state container.

[#1]: https://github.com/AlexandriteSoftware/asljs
