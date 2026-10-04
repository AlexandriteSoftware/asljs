# machine

> Part of [Alexandrite Software Library][#1] - a set of high-quality and
> performant JavaScript libraries for everyday use.

State machine library for JavaScript.

## Public Contract At A Glance

- Root export: `machine(initial, definition?)` or `machine(base, initial,
  definition?)`
- Public types: `Machine`, `MachineState`, `MachineTransition`, and the
  definition, option, payload, and event types in `src/types.ts`
- A machine is both eventful and observable, with typed events.
- One state is active at a time through `machine.state`.
- Transitions are named, so `machine.send('start')` drives the machine without
  holding transition objects.
- `machine.can('start')` answers whether that event would succeed.
- Every refusal is reported through the `rejected` event with a reason.
- Transitions are synchronous. Asynchronous work belongs between `send` calls.

## Canonical Example

```js
import { machine } from 'asljs-machine';

const light =
  machine(
    'red',
    { red: { go: 'green' },
      green: { slow: 'amber' },
      amber: { stop: 'red' } });

light.on(
  'transition',
  ({ from, to, event }) => {
    console.log(`${from.name} -> ${to.name} (${event})`);
  });

light.can('go');    // true
light.send('go');   // true, logs 'red -> green (go)'
light.can('stop');  // false, 'stop' is not an event of 'green'
light.send('stop'); // false, emits 'rejected' with reason 'unknown-event'

light.state.name;     // 'green'
light.previous.name;  // 'red'
```

## Runtime Model

- `machine(initial, definition?)` returns a new machine.
- `machine(base, initial, definition?)` returns the base object extended with
  machine behavior.
- `machine.state` holds the active state, and `machine.previous` holds the state
  left by the last successful transition, or `null`.
- Both are observable, so `machine.on('set:state', …)` and
  `machine.watch('state', …)` report every change. `watch` reports the current
  value first.
- `machine.send(event)` fires the active state's transition with that name.
- `machine.go(target)` fires the active state's transition that leads to
  `target`, named by state name or by state object. It only uses declared
  transitions, so it cannot jump outside the graph.
- `machine.can(event)` and `machine.canGo(target)` answer whether the call would
  succeed, guards included, without changing anything.
- `machine.getStates()` and `state.getTransitions()` return copies.
- `machine.getState(name)` and `state.getTransition(event)` return the object or
  `null`.
- `machine.createState(name?, options?)` and `state.createTransition(to,
  options?)` build the same machine imperatively.

## Declaring A Machine

A definition maps each state name to a map of event name to target:

```js
machine(
  'idle',
  { idle: { start: 'running' },
    running:
      { tick: { to: 'running', reentry: true },
        finish: 'done' },
    done: null });
```

- A string target is shorthand for `{ to: target }`.
- `when` is a guard: the transition is refused when it returns `false`.
- `reentry: true` allows a transition whose target is its own source state.
- `null` in place of the event map declares a final state.
- States are created in definition order, after the initial state.
- A definition that targets an unknown state throws.

Because the definition is plain data, it can be generated. The example agent
builds one pipeline state per configured document kind, so adding a pipeline is
a configuration change rather than a code change.

## Guards

A guard receives the transition payload and returns whether the transition may
run:

```js
const light =
  machine(
    'red',
    { red:
        { go:
            { to: 'green',
              when: () => pedestrianWaiting } },
      green: { stop: 'red' } });
```

Guards run inside `can`, `canGo`, and `activate`, so keep them cheap and free of
side effects.

## Transition Activation

Activation succeeds only when all of the following are true:

- the transition's source state is the active state
- another transition is not already running
- the source state is not final
- the target is not the source state, unless the transition allows reentry
- the guard, if any, returns true

## Rejection

`send`, `go`, and `activate` return `false` instead of throwing, and emit
`rejected` on the transition, when there is one, and then on the machine. The
payload carries `reason`, `event`, `from`, `to`, `machine`, and `transition`.

Reasons are:

- `unknown-event` - the active state has no transition with that name
- `unknown-state` - no state with that name belongs to this machine
- `no-transition` - the target exists, but the active state has no transition to
  it
- `not-active` - the transition's source state is not the active state
- `in-transition` - another transition is already running
- `final` - the source state is final
- `self-transition` - source and target are the same and reentry was not
  requested
- `guard` - the guard returned false

## Event Order

When activation succeeds, the contract order is:

1. transition `activating`
2. source state `leaving`
3. machine `set:previous`
4. machine `set:state`
5. target state `entered`
6. transition `completed`
7. machine `transition`

Steps 3 and 4 are the observable property updates, so listeners such as
`set:state` and `watch('state', …)` run as part of the transition flow.

## Asynchronous Work

Transitions are synchronous: the machine never awaits a listener. Run
asynchronous work between transitions, and let each result send the next event:

```js
if (agent.send('step')) {
  await runStep();
  agent.send('done');
}
```

That keeps `machine.state` an accurate answer to "what is happening right now",
which a transition that awaited its listeners could not provide.

## Safe Usage Rules

- Prefer a definition over imperative wiring, and name every transition that
  something outside the machine has to trigger.
- Drive enablement from `can` and `canGo` instead of from separate flags.
- Subscribe to `rejected` while developing; a silent `false` is usually a guard
  or a missing event name.
- Use this package for control-flow state transitions, not as a general app
  state store.

## Example

`examples/document-agent.ts` is a folder-monitoring document agent whose entire
control flow is one machine: it polls, classifies each document, routes it to a
preconfigured pipeline, walks the pipeline steps, and returns to idle through a
completed, failed, or discarded state. Run it with:

```
npm -w asljs-machine run example
```

## What Not To Assume

- Do not assume hierarchical statecharts.
- Do not assume parallel states.
- Do not assume transitions can target states from another machine.
- Do not assume a self-transition activates without `reentry`.
- Do not assume a final state can be left.
- Do not assume `machine.state` can be assigned; use `send` or `go`.
- Do not assume `getStates()` or `getTransitions()` return live collections.

## Related Packages

- For generic event APIs, see `asljs-eventful`.
- For observable property watching, see `asljs-observable`.
- Use `asljs-machine` for transition-based control flow rather than as a
  general-purpose state container.

[#1]: https://github.com/AlexandriteSoftware/asljs
