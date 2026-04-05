import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    observable,
    ObservableObjectBase
  } from '../observable.js';

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
  'watching arrays is not supported',
  async () => {
    const arr =
      observable(
        [ 1, 2, 3 ]);

    assert.throws(
      () =>
        observable.watch(
          arr as any,
          [ '0' ] as const,
          () => { }),
      /Watching arrays is not supported\./);

    assert.throws(
      () =>
        (arr as any).watch(
          [ '0' ],
          () => { }),
      /Watching arrays is not supported\./);
  });

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
  'observable.watch supports nested paths and nested updates',
  async () => {
    const state =
      observable(
        { user: { name: 'Alice' },
          active: false });

    const calls: Array<[string | undefined, boolean]> = [];

    observable.watch(
      state,
      [ 'user.name', 'active' ] as const,
      (userName: string | undefined, active: boolean) => {
        calls.push([ userName, active ]);
      });

    state.active = true;
    state.user.name = 'Bob';

    assert.deepEqual(
      calls,
      [ [ 'Alice', false ],
        [ 'Alice', true ],
        [ 'Bob', true ] ]);
  });

test(
  'observable.watch rebinds nested path when ancestor object changes',
  async () => {
    const state =
      observable(
        { user: { name: 'Alice' },
          active: false });

    const calls: Array<[string | undefined, boolean]> = [];

    observable.watch(
      state,
      [ 'user.name', 'active' ] as const,
      (userName: string | undefined, active: boolean) => {
        calls.push([ userName, active ]);
      });

    state.user =
      { name: 'Carol' } as any;

    state.user.name = 'Dan';

    assert.deepEqual(
      calls,
      [ [ 'Alice', false ],
        [ 'Carol', false ],
        [ 'Dan', false ] ]);
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
