import test from 'node:test';
import assert from 'node:assert/strict';
import { observable } from '../observable.js';

const CONTEXT_NAME = 'primitives.test';

/**
 * Telemetry gauge S5.1: a primitive reading wrapped as observable should emit
 * value transitions through the same event pipeline as object state.
 */
test(
  `${CONTEXT_NAME}: observable number`,
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
