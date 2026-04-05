import test from 'node:test';
import assert from 'node:assert/strict';
import { eventful } from 'asljs-eventful';
import { observable } from '../observable.js';

test(
  'observable <empty>',
  async () => {
    const obj =
      observable<number | undefined>(undefined);

    let newValue: any;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
  });

test(
  'throws when eventful option is not a function',
  async () => {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful: 123 as any }),
      /Expect a function\./);
  });

test(
  'observable reuses pre-eventful object',
  async () => {
    const source =
      eventful(
        { name: 'Alice' });

    const observed =
      observable(
        source,
        { eventful: () => {
            throw new Error('should not extend');
          } });

    let seen: string | undefined;

    observed.on(
      'set:name',
      ({ value }: any) => {
        seen = value;
      });

    observed.name = 'Bob';

    assert.equal(
      seen,
      'Bob');
  });
