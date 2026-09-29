import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { machine }
  from './index.js';

test(
  'index: exports machine factory',
  () =>
  {
    assert.equal(
      typeof machine,
      'function');
  });

test(
  'index: the exported factory builds a working machine',
  () =>
  {
    const flow =
      machine(
        'idle',
        { idle:
            { start: 'busy' },
          busy:
            { stop: 'idle' } });

    assert.equal(
      flow.send('start'),
      true);

    assert.equal(
      flow.state.name,
      'busy');
  });
