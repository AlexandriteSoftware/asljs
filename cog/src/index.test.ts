import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main/main.js';

test(
  'index exports main',
  t => {
    assert.equal(
      typeof main,
      'function');
  });
