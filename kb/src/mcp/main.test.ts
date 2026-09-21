import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main.js';

test(
  'main is the mcp entry point',
  () =>
  {
    assert.equal(
      typeof main,
      'function');

    assert.equal(
      main.length,
      0);
  });
