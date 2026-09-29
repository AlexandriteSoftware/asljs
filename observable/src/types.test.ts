import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { observable }
  from './observable.js';
import { Observable,
         ObservableGlobalOptions,
         ObservableOptions,
         ObservableTraceFn,
         ObservableWatchFn,
         WatchedValues,
         WatchPath,
         WatchPathValue,
         WatchPathValues }
  from './types.js';

const TEST_SUITE = 'types';

test(
  `${TEST_SUITE}: compile-time shapes can be referenced`,
  () =>
  {
    const options: ObservableOptions =
      { shallow: true,
        trace: null };

    const globalOptions: ObservableGlobalOptions =
      { trace: null };

    const traceFn: ObservableTraceFn =
      (
          _object,
          _action,
          _payload
        ) =>
      {};

    const watchFn: ObservableWatchFn =
      (
      _target: object,
      _properties: string | readonly string[],
      _callback: (...values: unknown[]) => void
    ) =>
    () => false;

    type BoxedNumber = Observable<number>;

    type Person = { name: string; age: number; };

    type PickedValues = WatchedValues<Person, ['name', 'age']>;

    const boxed: BoxedNumber | null = null;

    const picked: PickedValues =
      [ 'Alice',
        7 ];

    assert.ok(
      options.shallow);

    assert.equal(
      globalOptions.trace,
      null);

    assert.equal(
      typeof traceFn,
      'function');

    assert.equal(
      typeof watchFn,
      'function');

    assert.equal(
      boxed,
      null);

    assert.deepEqual(
      picked,
      [ 'Alice',
        7 ]);
  });

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false)
  : false;

type Model = {
  user: { name: string; address: { city: string; }; };
  active: boolean;
  tags: string[];
  created: Date;
};

test(
  `${TEST_SUITE}: WatchPath enumerates dotted paths and stops at leaves`,
  () =>
  {
    // Arrays and opaque values are leaves: descent stops there, matching what
    // the runtime converts.
    const exact: Equals<
      WatchPath<Model>,
      | 'user'
      | 'user.name'
      | 'user.address'
      | 'user.address.city'
      | 'active'
      | 'tags'
      | 'created'
    > = true;

    // Optional segments are followed through, `undefined` is not a path.
    const optional: Equals<
      WatchPath<{ user?: { name: string; }; }>,
      'user' | 'user.name'
    > = true;

    // Misspellings and eventful methods are simply not in the union, so a
    // call naming one cannot compile.
    const rejectsTypo: Equals<
      Extract<WatchPath<Model>, 'user.nmae'>,
      never
    > = true;

    const rejectsEventful: Equals<
      Extract<WatchPath<Model>, 'emit' | 'on' | 'off'>,
      never
    > = true;

    // Multi-path values stay positional.
    // Arrays carry no watch at all: watch(...) throws for them at runtime.
    const arraysHaveNoWatch: Equals<
      'watch' extends keyof Observable<number[]> ? true : false,
      false
    > = true;

    const positional: Equals<
      WatchPathValues<Model, ['user.name', 'active']>,
      [string, boolean]
    > = true;

    const city: Equals<
      WatchPathValue<Model, 'user.address.city'>,
      string
    > = true;

    const active: Equals<
      WatchPathValue<Model, 'active'>,
      boolean
    > = true;

    assert.ok(exact);

    assert.ok(rejectsTypo);

    assert.ok(rejectsEventful);

    assert.ok(arraysHaveNoWatch);

    assert.ok(positional);

    assert.ok(optional);

    assert.ok(city);

    assert.ok(active);
  });

test(
  `${TEST_SUITE}: watch accepts documented paths and rejects bad ones`,
  () =>
  {
    const state =
      observable(
        { user:
            { name: 'Alice' },
          active: false });

    // The nested-path form from README.md, with positional value types.
    const unwatch =
      state.watch(
        [ 'user.name',
          'active' ],
        (
            userName,
            active
          ) =>
        {
        const name: string = userName;

        const flag: boolean = active;

        assert.equal(
          typeof name,
          'string');

        assert.equal(
          typeof flag,
          'boolean');
      });

    state.watch(
      'user.name',
      (
          value
        ) =>
      {
        const name: string = value;

        assert.equal(
          typeof name,
          'string');
      });

    assert.equal(
      typeof unwatch,
      'function');
  });
