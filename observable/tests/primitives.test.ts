import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';

test(
  'observable number',
  async () => {
    const obj =
      observable(42);

    let newValue: number | undefined;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(newValue, 43);
  });
