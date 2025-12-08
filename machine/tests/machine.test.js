import test from 'node:test';
import assert from 'node:assert/strict';
import { machine } from '../machine.js';

test(
  'state transitions',
  () => {
    const m =
      machine({ }, 'idle');

    const select =
      m.state.createTransition(
        m.createState('selected'));

    const events = [];

    m.on(
      'set:state',
      e => events.push(`state:${e.value.name}`));

    select.on(
      'activating',
      () => events.push('select:activating'));

    select.on(
      'completed',
      () => events.push('select:completed'));

    select.activate();

    assert.strictEqual(
      m.state.name,
      'selected');

    assert.deepStrictEqual(
      events,
      [ 'select:activating',
        'state:selected',
        'select:completed' ]);
  });