import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { NullLogger }
  from './null-logger.js';

test(
  'null logger enables only silent level',
  () =>
  {
    const logger =
      new NullLogger();

    assert.equal(
      logger.isLevelEnabled(
        'silent'),
      true);

    assert.equal(
      logger.isLevelEnabled(
        'trace'),
      false);
  });
