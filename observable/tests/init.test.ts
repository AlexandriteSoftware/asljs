import test from 'node:test';
import assert from 'node:assert/strict';
import { eventful } from 'asljs-eventful';
import {
    observable,
    ObservableObjectBase
  } from '../observable.js';

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
  'observable adds non-enumerable watch method when missing',
  async () => {
    const obj =
      observable(
        { a: 1,
          b: 2 });

    assert.equal(
      typeof (obj as any).watch,
      'function');

    assert.equal(
      Object.keys(obj).includes('watch'),
      false);

    const calls: Array<[number, number]> = [];

    (obj as any).watch(
      [ 'a', 'b' ],
      (a: number, b: number) => {
        calls.push([ a, b ]);
      });

    obj.b = 4;

    assert.deepEqual(
      calls,
      [ [ 1, 2 ],
        [ 1, 4 ] ]);
  });

test(
  'observable does not override existing watch method',
  async () => {
    const originalWatch =
      (): any => { };

    const obj =
      observable(
        { a: 1,
          watch: originalWatch } as any);

    assert.equal(
      obj.watch,
      originalWatch);
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
