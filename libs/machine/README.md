# machine

> Part of [Alexandrite Software Library][#1] - a set of high-quality and
> performant JavaScript libraries for everyday use.

## Overview

`asljs-machine` is a state machine for JavaScript control flow. A machine is
declared as plain data, holds one active state, and moves between states through
named transitions:

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

light.send('go');   // true, logs 'red -> green (go)'
light.send('stop'); // false, emits 'rejected' with reason 'unknown-event'

light.state.name;     // 'green'
light.previous.name;  // 'red'
```

## Scope

- **Named transitions.** `machine.send('start')` drives the machine without
  holding transition objects, and `machine.can('start')` answers whether it
  would succeed.
- **Explicit refusals.** A refused transition returns `false` and emits a
  `rejected` event with a reason, rather than throwing.
- **Observable state.** A machine is both eventful and observable, with typed
  events, so `machine.state` can be watched like any other property.
- **Synchronous transitions.** Asynchronous work runs between `send` calls, so
  `machine.state` always says what is happening now.

The model is a flat set of states with one active at a time: hierarchical and
parallel states are out of scope, and so is use as a general application state
store.

## Installation

```bash
npm install asljs-machine
```

NPM Package: [asljs-machine][NPM]

## Usage

A definition maps each state name to a map of event name to target. A target can
carry a guard, and `null` declares a final state:

```js
import { machine } from 'asljs-machine';

let pending = 3;

const job =
  machine(
    'idle',
    { idle: { start: 'running' },
      running:
        { tick:
            { to: 'running',
              reentry: true,
              when: () => pending > 0 },
          finish: 'done' },
      done: null });

job.on('rejected', ({ reason, event }) => console.log(event, reason));

job.send('start');

while (job.can('tick')) {
  job.send('tick');
  pending--;
}

job.send('finsh');  // false, logs 'finsh unknown-event'
job.send('finish'); // true

job.state.name;     // 'done'
```

Drive enablement from `can` and `canGo` rather than from separate flags, and
subscribe to `rejected` while developing: a silent `false` is usually a guard or
a misspelled event name.

## Further reading

- [Runtime model][RTM] - declaring a machine, guards, activation rules,
  rejection reasons, event order, and asynchronous work.
- [Reference][REF] - every export, method, event, option and payload.
- [Examples][EXA] - a folder-monitoring document agent whose whole control flow
  is one machine.

Questions and bugs: [asljs/issues][ISS].

## Related packages

- `asljs-eventful` provides the event API every machine, state and transition
  carries.
- `asljs-observable` makes `state` and `previous` observable.

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[EXA]: examples/README.md
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
[NPM]: https://www.npmjs.com/package/asljs-machine
[REF]: REFERENCE.md
[RTM]: <docs/Runtime Model.md>
