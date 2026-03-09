import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    observable,
    ObservableObjectBase
  } from '../observable.js';

test(
  'observable.watch tracks selected properties and emits initial callback',
  async () => {
    const obj =
      observable(
        { a: 1,
          b: 2,
          c: 3 });

    const calls: Array<[number, number]> = [];

    observable.watch(
      obj,
      [ 'a', 'b' ] as const,
      (a, b) => {
        calls.push([ a, b ]);
      });

    obj.a = 10;
    obj.c = 30;
    obj.b = 20;

    assert.deepEqual(
      calls,
      [ [ 1, 2 ],
        [ 10, 2 ],
        [ 10, 20 ] ]);
  });

test(
  'observable.watch returns disposer for all attached listeners',
  () => {
    const obj =
      observable(
        { a: 1,
          b: 2 });

    const calls: Array<[number, number]> = [];

    const unwatch =
      observable.watch(
        obj,
        [ 'a', 'b' ] as const,
        (a, b) => {
          calls.push([ a, b ]);
        });

    obj.a = 10;

    assert.equal(
      unwatch(),
      true);

    obj.b = 20;

    assert.equal(
      unwatch(),
      false);

    assert.deepEqual(
      calls,
      [ [ 1, 2 ],
        [ 10, 2 ] ]);
  });

test(
  'ObservableObjectBase watch with setAndEmit',
  () => {
    const obj =
      new ObjWithName();

    const calls: string[] = [];

    obj.watch(
      [ 'name' ],
      (name: string) => {
        calls.push(name);
      });

    obj.name = 'Alice';
    obj.name = 'Alice';
    obj.name = 'Bob';

    assert.deepEqual(
      calls,
      [ '',
        'Alice',
        'Bob' ]);
  });

test(
  'ObservableObjectBase watch returns disposer',
  () => {
    const obj =
      new ObjWithName();

    const calls: string[] = [];

    const unwatch =
      obj.watch(
        [ 'name' ],
        (name: string) => {
          calls.push(name);
        });

    obj.name = 'Alice';

    assert.equal(
      unwatch(),
      true);

    obj.name = 'Bob';

    assert.deepEqual(
      calls,
      [ '',
        'Alice' ]);
  });

test(
  'ObservableObjectBase watch accepts a property name string',
  () => {
    const obj =
      new ObjWithName();

    const calls: string[] = [];

    obj.watch(
      'name',
      (name: string) =>
        calls.push(name));

    obj.name = 'Alice';
    obj.name = 'Alice';
    obj.name = 'Bob';

    assert.deepEqual(
      calls,
      [ '',
        'Alice',
        'Bob' ]);
  });

class ObjWithName
  extends ObservableObjectBase<{ name: string }>
{
  #name: string = '';

  constructor() {
    super();
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.setAndEmit(
      'name',
      this.#name,
      value,
      (next: string) =>
        this.#name = next);
  }
}
