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

test(
  'null logger scope returns a logger that also discards entries',
  () =>
  {
    const logger =
      new NullLogger();

    const scoped =
      logger.scope(
        { requestId: 'r1' });

    assert.equal(
      scoped.level,
      'silent');

    scoped.information('ignored');
  });
