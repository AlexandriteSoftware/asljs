import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    machine,
  } from './index.js';

test(
  'state transitions',
  () => {
    const currentMachine =
      machine({ }, 'idle');

    const select =
      currentMachine.state.createTransition(
        currentMachine.createState('selected'));

    const events: string[] = [];

    currentMachine.on(
      'set:state',
      event => {
        const stateEvent =
          event as { value: { name: string | undefined; }; };

        events.push(`state:${stateEvent.value.name}`);
      });

    select.on(
      'activating',
      () => {
        events.push('select:activating');
      });

    select.on(
      'completed',
      () => {
        events.push('select:completed');
      });

    select.activate();

    assert.strictEqual(
      currentMachine.state.name,
      'selected');

    assert.deepStrictEqual(
      events,
      [ 'select:activating',
        'state:selected',
        'select:completed' ]);
  });