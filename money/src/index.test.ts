import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    money,
  } from './index.js';

test(
  'index: exports money factory',
  () => {
    assert.equal(
      typeof money,
      'function');

    assert.equal(
      typeof money.fromString,
      'function');

    assert.equal(
      typeof money.fromNumber,
      'function');
  });