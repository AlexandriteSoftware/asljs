import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { NullLogger }
  from './logger.js';

test(
  'NullLogger has all levels disabled, except silent',
  () => {
    const logger = new NullLogger();
    
    assert.strictEqual(
      logger.isLevelEnabled('trace'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('debug'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('info'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('warn'),
      false);

    assert.strictEqual(
      logger.isLevelEnabled('error'),
      false);
  });
    