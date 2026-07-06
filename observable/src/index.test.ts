import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { observable,
         ObservableObject }
  from './index.js';

const TEST_SUITE =
  'index';

test(
  `${TEST_SUITE}: exports public api`,
  () => {
    assert.equal(
      typeof observable,
      'function');

    assert.equal(
      typeof ObservableObject,
      'function');
  });

