import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { asEventfulLike,
         eventful,
         EventfulBase,
         type EventfulFn,
         type GlobalEvents,
         isEventfulLike,
         ListenerError }
  from './index.js';

const TEST_SUITE = 'index';

test(
  `${TEST_SUITE}: exports public api`,
  () =>
  {
    assert.equal(
      typeof eventful,
      'function');

    assert.equal(
      typeof EventfulBase,
      'function');

    assert.equal(
      typeof asEventfulLike,
      'function');

    assert.equal(
      typeof isEventfulLike,
      'function');

    assert.equal(
      typeof ListenerError,
      'function');
  });

test(
  `${TEST_SUITE}: exports the type of the package-level emitter`,
  () =>
  {
    const emitter: EventfulFn = eventful;

    const seen: GlobalEvents['new'][0][] = [ ];

    const off =
      emitter.on(
        'new',
        (
            payload
          ) =>
        {
        seen.push(payload);
      });

    try {
      emitter({});
    } finally {
      off();
    }

    assert.equal(
      seen.length,
      1);

    assert.equal(
      typeof seen[0]?.id,
      'string');
  });
