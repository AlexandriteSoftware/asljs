import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    List
  } from './index.js';

test(
  'index: exports list component',
  () => {
    assert.equal(
      typeof List,
      'function');
  });
