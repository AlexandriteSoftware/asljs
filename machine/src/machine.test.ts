import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { machine }
  from './machine.js';
import { MachineRejectionPayload,
         MachineRejectReason }
  from './types.js';

function reasonsOf(
    events: MachineRejectionPayload[]
  ): MachineRejectReason[]
{
  return events.map(
    event => event.reason);
}

function trafficLight(
  ): ReturnType<typeof machine>
{
  return machine(
    'red',
    { red:
        { go: 'green' },
      green:
        { slow: 'amber' },
      amber:
        { stop: 'red' } });
}

test(
  'machine: accepts an initial state without a base object',
  () =>
  {
    const light =
      machine('red');

    assert.equal(
      light.state.name,
      'red');

    assert.equal(
      light.previous,
      null);
  });

test(
  'machine: extends the base object',
  () =>
  {
    const light =
      machine(
        { label: 'crossing' },
        'red');

    assert.equal(
      light.label,
      'crossing');

    assert.equal(
      light.state.name,
      'red');
  });

test(
  'machine: rejects a missing or empty initial state name',
  () =>
  {
    assert.throws(
      () => machine(''),
      /non-empty state name/);

    assert.throws(
      () =>
        machine(
          {},
          42 as unknown as string),
      /non-empty state name/);
  });

test(
  'machine: rejects a non-object definition',
  () =>
  {
    assert.throws(
      () =>
        machine(
          'red',
          'green' as unknown as Record<string, null>),
      /must be an object/);
  });

test(
  'machine: builds states and transitions from a definition',
  () =>
  {
    const light =
      trafficLight();

    assert.deepEqual(
      light.getStates().map(
        state => state.name),
      [ 'red',
        'green',
        'amber' ]);

    assert.deepEqual(
      light.state.getTransitions().map(
        transition => transition.name),
      [ 'go' ]);

    assert.equal(
      light.send('go'),
      true);

    assert.equal(
      light.state.name,
      'green');

    assert.equal(
      light.previous?.name,
      'red');
  });

test(
  'machine: rejects a definition that targets an unknown state',
  () =>
  {
    assert.throws(
      () =>
        machine(
          'red',
          { red:
              { go: 'purple' } }),
      /unknown state "purple"/);
  });

test(
  'machine: emits transition events in the documented order',
  () =>
  {
    const light =
      trafficLight();

    const go =
      light.state.getTransition('go');

    assert.notEqual(
      go,
      null);

    const green =
      light.getState('green');

    const events: string[] = [ ];

    go?.on(
      'activating',
      () =>
        events.push(
          'transition:activating'));

    light.state.on(
      'leaving',
      () => events.push('red:leaving'));

    light.on(
      'set:previous',
      () =>
        events.push(
          'machine:set:previous'));

    light.on(
      'set:state',
      event =>
        events.push(
          `machine:set:state=${event.value.name}`));

    green?.on(
      'entered',
      () => events.push('green:entered'));

    go?.on(
      'completed',
      () =>
        events.push(
          'transition:completed'));

    light.on(
      'transition',
      event =>
        events.push(
          `machine:transition=${event.from.name}->${event.to.name}`));

    assert.equal(
      light.send('go'),
      true);

    assert.deepEqual(
      events,
      [ 'transition:activating',
        'red:leaving',
        'machine:set:previous',
        'machine:set:state=green',
        'green:entered',
        'transition:completed',
        'machine:transition=red->green' ]);
  });

test(
  'machine: reports an unknown event without changing state',
  () =>
  {
    const light =
      trafficLight();

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      light.can('stop'),
      false);

    assert.equal(
      light.send('stop'),
      false);

    assert.equal(
      light.state.name,
      'red');

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'unknown-event' ]);

    assert.equal(
      rejections[0]?.event,
      'stop');

    assert.equal(
      rejections[0]?.to,
      null);
  });

test(
  'machine: applies a guard to can and to send',
  () =>
  {
    let pedestrianWaiting = false;

    const light =
      machine(
        'red',
        { red:
            { go:
                { to: 'green',
                  when:
                    () => pedestrianWaiting } },
          green:
            { stop: 'red' } });

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      light.can('go'),
      false);

    assert.equal(
      light.send('go'),
      false);

    assert.equal(
      light.state.name,
      'red');

    pedestrianWaiting = true;

    assert.equal(
      light.can('go'),
      true);

    assert.equal(
      light.send('go'),
      true);

    assert.equal(
      light.state.name,
      'green');

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'guard' ]);
  });

test(
  'machine: rejects a transition whose source state is not active',
  () =>
  {
    const light =
      trafficLight();

    const slow =
      light.getState('green')?.getTransition('slow');

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      slow?.can(),
      false);

    assert.equal(
      slow?.activate(),
      false);

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'not-active' ]);
  });

test(
  'machine: rejects a transition started while another one runs',
  () =>
  {
    const light =
      trafficLight();

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    light.state.on(
      'leaving',
      () =>
      {
        light.send('go');
      });

    assert.equal(
      light.send('go'),
      true);

    assert.equal(
      light.state.name,
      'green');

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'in-transition' ]);
  });

test(
  'machine: rejects a self transition unless reentry is requested',
  () =>
  {
    const light =
      machine(
        'red',
        { red:
            { blink: 'red',
              flash:
                { to: 'red',
                  reentry: true } } });

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      light.send('blink'),
      false);

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'self-transition' ]);

    let entered = 0;

    light.state.on(
      'entered',
      () =>
      {
        entered += 1;
      });

    assert.equal(
      light.send('flash'),
      true);

    assert.equal(
      entered,
      1);

    assert.equal(
      light.previous?.name,
      'red');
  });

test(
  'machine: never leaves a final state',
  () =>
  {
    const game =
      machine(
        'playing',
        { playing:
            { win: 'won' },
          won: null });

    assert.equal(
      game.getState('won')?.final,
      true);

    assert.equal(
      game.state.final,
      false);

    const rejections: MachineRejectionPayload[] = [ ];

    game.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      game.send('win'),
      true);

    assert.equal(
      game.state.final,
      true);

    assert.equal(
      game.send('win'),
      false);

    assert.equal(
      game.go('playing'),
      false);

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'unknown-event',
        'no-transition' ]);
  });

test(
  'machine: treats a final initial state as final',
  () =>
  {
    const done =
      machine(
        'done',
        { done: null });

    assert.equal(
      done.state.final,
      true);
  });

test(
  'machine: go uses declared transitions only',
  () =>
  {
    const light =
      trafficLight();

    const rejections: MachineRejectionPayload[] = [ ];

    light.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      light.canGo('purple'),
      false);

    assert.equal(
      light.go('purple'),
      false);

    assert.equal(
      light.canGo('amber'),
      false);

    assert.equal(
      light.go('amber'),
      false);

    assert.equal(
      light.canGo('green'),
      true);

    assert.equal(
      light.go('green'),
      true);

    assert.equal(
      light.state.name,
      'green');

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'unknown-state',
        'no-transition' ]);
  });

test(
  'machine: go accepts a state object of the same machine',
  () =>
  {
    const light =
      trafficLight();

    const green =
      light.getState('green');

    assert.notEqual(
      green,
      null);

    assert.equal(
      light.go(green!),
      true);

    assert.equal(
      light.state,
      green);
  });

test(
  'machine: rejects a state object from another machine',
  () =>
  {
    const first =
      trafficLight();

    const second =
      trafficLight();

    const rejections: MachineRejectionPayload[] = [ ];

    first.on(
      'rejected',
      event => rejections.push(event));

    assert.equal(
      first.go(
        second.getState('green')!),
      false);

    assert.deepEqual(
      reasonsOf(rejections),
      [ 'unknown-state' ]);
  });

test(
  'machine: exposes states and transitions as copies',
  () =>
  {
    const light =
      trafficLight();

    const states =
      light.getStates();

    states.length = 0;

    assert.equal(
      light.getStates().length,
      3);

    const transitions =
      light.state.getTransitions();

    transitions.length = 0;

    assert.equal(
      light.state.getTransitions().length,
      1);
  });

test(
  'machine: keeps injected methods non-enumerable',
  () =>
  {
    const light =
      machine(
        { label: 'crossing' },
        'red');

    assert.deepEqual(
      Object.keys(light).sort(),
      [ 'label',
        'previous',
        'state' ]);

    assert.deepEqual(
      Object.keys(light.state).sort(),
      [ 'final',
        'machine',
        'name' ]);
  });

test(
  'machine: creates states and transitions imperatively',
  () =>
  {
    const flow =
      machine('idle');

    const busy =
      flow.createState('busy');

    const start =
      flow.state.createTransition(
        busy,
        { name: 'start' });

    assert.equal(
      start.name,
      'start');

    assert.equal(
      start.from,
      flow.state);

    assert.equal(
      start.to,
      busy);

    assert.equal(
      start.machine,
      flow);

    assert.equal(
      flow.send('start'),
      true);

    assert.equal(
      flow.state,
      busy);
  });

test(
  'machine: creates an unnamed state that send cannot reach',
  () =>
  {
    const flow =
      machine('idle');

    const anonymous =
      flow.createState();

    const step =
      flow.state.createTransition(anonymous);

    assert.equal(
      step.name,
      undefined);

    assert.equal(
      flow.getState('busy'),
      null);

    assert.equal(
      step.activate(),
      true);

    assert.equal(
      flow.state,
      anonymous);
  });

test(
  'machine: rejects duplicate state names',
  () =>
  {
    const flow =
      machine('idle');

    assert.throws(
      () => flow.createState('idle'),
      /State "idle" already exists/);
  });

test(
  'machine: rejects duplicate transition event names on one state',
  () =>
  {
    const flow =
      machine(
        'idle',
        { idle:
            { start: 'busy' },
          busy:
            { stop: 'idle' } });

    assert.throws(
      () =>
        flow.state.createTransition(
          flow.getState('busy')!,
          { name: 'start' }),
      /Transition "start" already exists/);
  });

test(
  'machine: rejects a transition that targets another machine',
  () =>
  {
    const first =
      machine('idle');

    const second =
      machine('idle');

    assert.throws(
      () =>
        first.state.createTransition(
          second.state),
      /not part of this machine/);
  });

test(
  'machine: watches the active state',
  () =>
  {
    const light =
      trafficLight();

    const seen: (string | undefined)[] = [ ];

    light.watch(
      'state',
      value => seen.push(value?.name));

    light.send('go');
    light.send('slow');

    // `watch` reports the current value first, then every change.
    assert.deepEqual(
      seen,
      [ 'red',
        'green',
        'amber' ]);
  });
