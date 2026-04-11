import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    Table,
    dbOpen,
    IncrementTableVersionStrategy,
  UuidSoftDeleteTableDeleteStrategy,
  } from './index.js';

test(
  'index: exports table api',
  () => {
    assert.equal(
      typeof dbOpen,
      'function');

    assert.equal(
      typeof Table,
      'function');

    assert.equal(
      typeof IncrementTableVersionStrategy,
      'function');

    assert.equal(
      typeof UuidSoftDeleteTableDeleteStrategy,
      'function');
  });
