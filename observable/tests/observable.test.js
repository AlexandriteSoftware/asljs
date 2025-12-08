import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';

test(
  'observable for primitive values',
  async () => {
    const obj =
      observable(42);

    let newValue;

    obj.on(
      'set',
      v => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(newValue, 43);
  }
);
