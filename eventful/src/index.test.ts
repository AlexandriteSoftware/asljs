import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { eventful,
         EventfulBase,
         asEventfulLike,
         isEventfulLike,
         ListenerError }
  from './index.js';

const TEST_SUITE =
  'index';

test(
  `${TEST_SUITE}: exports public api`,
  () => {
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

