import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    observable
  } from './observable.js';
import {
    ObservableObject
  } from './observable-object.js';

const TEST_SUITE =
  'watch';

/**
 * Plain objects should gain a hidden watch method so consumers can subscribe
 * without polluting enumerable shape.
 */
test(
  `${TEST_SUITE}: observable adds non-enumerable watch method when missing`,
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

/**
 * Pre-existing watch implementations must be preserved to avoid breaking
 * host-specific semantics.
 */
test(
  `${TEST_SUITE}: observable does not override existing watch method`,
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

/**
 * Attempting watch() on array targets must fail explicitly so unsupported
 * behavior is never mistaken for silent success.
 */
test(
  `${TEST_SUITE}: watching arrays is not supported`,
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

/**
 * Multi-field watchers need an initial snapshot and updates only when selected
 * paths change.
 */
test(
  `${TEST_SUITE}: observable.watch tracks selected properties and emits initial callback`,
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
      (a: number, b: number) => {
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

/**
 * One-path subscriptions should work without forcing callers to allocate an
 * array wrapper.
 */
test(
  `${TEST_SUITE}: observable.watch accepts a single string path`,
  async () => {
    const obj =
      observable(
        { a: 1,
          b: 2 });

    const calls: number[] = [];

    observable.watch(
      obj,
      'a',
      (a: number) => {
        calls.push(a);
      });

    obj.b = 20;
    obj.a = 10;

    assert.deepEqual(
      calls,
      [ 1,
        10 ]);
  });

/**
 * Injected instance watch() should mirror function API support for a single
 * string path.
 */
test(
  `${TEST_SUITE}: injected watch method accepts a single string path`,
  async () => {
    const obj =
      observable(
        { a: 1,
          b: 2 });

    const calls: number[] = [];

    obj.watch(
      'a',
      (a: number) => {
        calls.push(a);
      });

    obj.b = 20;
    obj.a = 10;

    assert.deepEqual(
      calls,
      [ 1,
        10 ]);
  });

/**
 * Deep path subscriptions must react to leaf edits while independent paths
 * continue to report current values.
 */
test(
  `${TEST_SUITE}: observable.watch supports nested paths and nested updates`,
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

/**
 * Replacing an ancestor object should rebind deep listeners so future leaf
 * edits are still observed.
 */
test(
  `${TEST_SUITE}: observable.watch rebinds nested path when ancestor object changes`,
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

/**
 * The disposer must detach every listener and remain idempotent across
 * repeated calls.
 */
test(
  `${TEST_SUITE}: observable.watch returns disposer for all attached listeners`,
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
        (a: number, b: number) => {
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

/**
 * Malformed paths should be rejected immediately to prevent hidden no-op
 * subscriptions.
 */
test(
  `${TEST_SUITE}: observable.watch rejects empty and malformed paths`,
  () => {
    const state =
      observable(
        { user: { name: 'Alice' } });

    const callback =
      (): void => { };

    const invalidPaths =
      [ '',
        '   ',
        '.user.name',
        'user.name.',
        'user..name',
        'user. .name' ] as const;

    for (const path of invalidPaths) {
      assert.throws(
        () =>
          observable.watch(
            state,
            [ path ],
            callback),
        TypeError);
    }
  });

/**
 * Plain roots should still support an immediate snapshot even without any
 * eventful source, but they cannot react to later updates.
 */
test(
  `${TEST_SUITE}: observable.watch supports non-eventful root with snapshot only`,
  () => {
    const plainState =
      { user: { name: 'Alice' } };

    const calls: Array<string | undefined> = [];

    observable.watch(
      plainState as any,
      'user.name',
      (name: string | undefined) => {
        calls.push(name);
      });

    plainState.user.name =
      'Bob';

    assert.deepEqual(
      calls,
      [ 'Alice' ]);
  });

    /**
 * Even when the root is plain, nested eventful objects should still drive
 * updates when a listener can be attached at the eventful segment.
     */
    test(
  `${TEST_SUITE}: observable.watch supports non-eventful root with nested eventful segments`,
      () => {
    const user =
      observable(
        { name: 'Alice' },
        { shallow: true });

        const plainState =
      { user };

    const calls: Array<string | undefined> = [];

    observable.watch(
      plainState as any,
      [ 'user.name' ],
      (name: string | undefined) => {
        calls.push(name);
      });

    user.name =
      'Bob';

    plainState.user =
      observable(
        { name: 'Carol' },
        { shallow: true });

    (plainState.user as any).name =
      'Dan';

    assert.deepEqual(
      calls,
      [ 'Alice',
        'Bob' ]);
      });

/**
 * Non-string or non-array path selectors must fail fast to keep watch input
 * semantics strict and debuggable.
 */
test(
  `${TEST_SUITE}: observable.watch rejects invalid properties input type`,
  () => {
    const state =
      observable(
        { a: 1 });

    assert.throws(
      () =>
        observable.watch(
          state,
          123 as any,
          () => { }),
      /Expect properties to be a string or an array of strings\./);
  });

/**
 * Mixed-type selector arrays should throw before binding so partial
 * subscriptions never sneak in.
 */
test(
  `${TEST_SUITE}: observable.watch rejects non-string items in properties array`,
  () => {
    const state =
      observable(
        { a: 1 });

    assert.throws(
      () =>
        observable.watch(
          state,
          [ 'a', 1 as any ],
          () => { }),
      /Expect properties to be a string or an array of strings\./);
  });

/**
 * Nested watchers should become active after a missing ancestor object is
 * created later.
 */
test(
  `${TEST_SUITE}: observable.watch nested path rebinds when ancestor is created later`,
  () => {
    const state =
      observable(
        { user: undefined as undefined | { name: string; } });

    const calls: Array<string | undefined> = [];

    observable.watch(
      state,
      'user.name',
      (name: string | undefined) => {
        calls.push(name);
      });

    state.user =
      { name: 'Alice' };

    state.user.name =
      'Bob';

    assert.deepEqual(
      calls,
      [ undefined,
        'Alice',
        'Bob' ]);
  });

/**
 * Watching partially initialised model should emit undefined once at start,
 * then resolve to concrete values when missing path segments appear.
 */
test(
  `${TEST_SUITE}: watching partially initialised model`,
  () => {
    const state =
      observable(
        { user: {} as { info?: { name: string; }; } });

    const calls: Array<string | undefined> = [];

    observable.watch(
      state,
      'user.info.name',
      (name: string | undefined) => {
        calls.push(name);
      });

    assert.deepEqual(
      calls,
      [ undefined ]);

    state.user.info =
      { name: 'Alice' };

    assert.deepEqual(
      calls,
      [ undefined,
        'Alice' ]);
  });

/**
 * Paths that traverse only plain nested objects (no eventful segments beyond
 * the root) should still provide initial snapshots and refresh when an
 * observable ancestor is replaced.
 */
test(
  `${TEST_SUITE}: watches path when nested segments are non-eventful`,
  () => {
    const state =
      observable(
        { user: { info: { name: 'Alice' } } },
        { shallow: true });

    const calls: Array<string | undefined> = [];

    observable.watch(
      state,
      'user.info.name',
      (name: string | undefined) => {
        calls.push(name);
      });

    // Leaf edits do not emit without eventful objects along nested segments.
    state.user.info.name =
      'Bob';

    // Replacing the observable ancestor segment emits with refreshed value.
    state.user =
      { info: { name: 'Carol' } };

    assert.deepEqual(
      calls,
      [ 'Alice',
        'Carol' ]);
  });

/**
 * Mixed path segments should still work: updates at observable boundaries must
 * refresh callbacks, and switching to observable nested objects should enable
 * deeper leaf updates.
 */
test(
  `${TEST_SUITE}: supports mixed observable and non-observable path segments`,
  () => {
    const user =
      observable(
        { info: { name: 'Alice' } },
        { shallow: true });

    const state =
      observable(
        { user },
        { shallow: true });

    const calls: Array<string | undefined> = [];

    observable.watch(
      state,
      'user.info.name',
      (name: string | undefined) => {
        calls.push(name);
      });

    // info is not observable yet, but user is; changing info should refresh.
    user.info =
      { name: 'Bob' };

    // swap to observable info; path should rebind to set:name.
    user.info =
      observable(
        { name: 'Carol' },
        { shallow: true }) as any;

    (user.info as any).name =
      'Dan';

    assert.deepEqual(
      calls,
      [ 'Alice',
        'Bob',
        'Carol',
        'Dan' ]);
  });

/**
 * ObservableObject with setAndEmit should deliver deduplicated change
 * notifications for class-based models.
 */
test(
  `${TEST_SUITE}: ObservableObject watch with setAndEmit`,
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

/**
 * Class-based watch() must provide a disposer that reliably detaches listeners
 * after unsubscribe.
 */
test(
  `${TEST_SUITE}: ObservableObject watch returns disposer`,
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

/**
 * ObservableObject watch() should accept a single property key string for
 * concise subscription code.
 */
test(
  `${TEST_SUITE}: ObservableObject watch accepts a property name string`,
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
  extends ObservableObject<{ name: string }>
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
