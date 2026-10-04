import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Change,
         isObservable,
         Observable }
  from './contract.js';
import { observable }
  from './observable.js';
import { observe }
  from './observe.js';
import { Converted,
         ObservableGlobalOptions,
         ObservableOptions,
         ObservablePath,
         ObservablePathValue,
         ObservablePathValues,
         ObservableTraceFn }
  from './types.js';

const TEST_SUITE = 'types';

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false)
  : false;

type Model = {
  user: { name: string; address: { city: string; }; };
  active: boolean;
  tags: string[];
};

test(
  `${TEST_SUITE}: compile-time shapes can be referenced`,
  () =>
  {
    const options: ObservableOptions =
      { deep: true,
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

    type BoxedNumber = Converted<number>;

    const boxed: BoxedNumber | null = null;

    assert.ok(
      options.deep);

    assert.equal(
      globalOptions.trace,
      null);

    assert.equal(
      typeof traceFn,
      'function');

    assert.equal(
      boxed,
      null);
  });

/**
 * The contract is an artifact of this package, with `on`/`off` returning
 * `unknown` so that the type admits what the runtime admits.
 */
test(
  `${TEST_SUITE}: the contract admits an emitter that returns anything`,
  () =>
  {
    const returnsThis: Observable =
      { on(): unknown
      {
        return this;
      },
        off(): unknown
      {
        return this;
      } };

    const returnsDisposer: Observable =
      { on:
          () => (): boolean => true,
        off: () => true };

    assert.equal(
      typeof returnsThis.on,
      'function');

    assert.equal(
      typeof returnsDisposer.on,
      'function');

    const setEntry: Change =
      { kind: 'set',
        property: 'a',
        value: 1,
        previous: 0 };

    const spliceEntry: Change =
      { kind: 'splice',
        index: 0,
        removed:
          [ 'a' ],
        added: [ ] };

    assert.equal(
      setEntry.kind,
      'set');

    assert.equal(
      spliceEntry.kind,
      'splice');
  });

/**
 * `README.md` restates this shape under "The contract". Pinned here so that a
 * change to it is deliberate, and so that the restatement is updated with it.
 */
test(
  `${TEST_SUITE}: the Change shape is pinned`,
  () =>
  {
    type Restated =
      | { kind: 'set'; property: string; value: unknown; previous: unknown; }
      | {
        kind: 'splice';
        index: number;
        removed: readonly unknown[];
        added: readonly unknown[];
      }
      | { kind: 'reset'; };

    const pinned: Equals<Change, Restated> = true;

    assert.ok(pinned);
  });

test(
  `${TEST_SUITE}: ObservablePath enumerates dotted paths`,
  () =>
  {
    // Object paths, with arrays descended through their indices rather than
    // treated as leaves.
    const objectPaths: Equals<
      Extract<ObservablePath<Model>, `user${string}` | 'active'>,
      | 'user'
      | 'user.name'
      | 'user.address'
      | 'user.address.city'
      | 'active'
    > = true;

    const arrayPaths: Equals<
      Extract<ObservablePath<Model>, 'tags' | 'tags.length'>,
      'tags' | 'tags.length'
    > = true;

    // Optional segments are followed through; `undefined` is not a path.
    const optional: Equals<
      ObservablePath<{ user?: { name: string; }; }>,
      'user' | 'user.name'
    > = true;

    // Misspellings and the methods conversion adds are simply not in the
    // union, so a call naming one cannot compile.
    const rejectsTypo: Equals<
      Extract<ObservablePath<Model>, 'user.nmae'>,
      never
    > = true;

    const rejectsEventful: Equals<
      Extract<
        ObservablePath<Converted<Model>>,
        'emit' | 'on' | 'off' | 'getListeners'
      >,
      never
    > = true;

    const positional: Equals<
      ObservablePathValues<Model, ['user.name', 'active']>,
      [string, boolean]
    > = true;

    const city: Equals<
      ObservablePathValue<Model, 'user.address.city'>,
      string
    > = true;

    const element: Equals<
      ObservablePathValue<Model, 'tags.0'>,
      string
    > = true;

    const length: Equals<
      ObservablePathValue<Model, 'tags.length'>,
      number
    > = true;

    assert.ok(objectPaths);

    assert.ok(arrayPaths);

    assert.ok(optional);

    assert.ok(rejectsTypo);

    assert.ok(rejectsEventful);

    assert.ok(positional);

    assert.ok(city);

    assert.ok(element);

    assert.ok(length);
  });

test(
  `${TEST_SUITE}: observe accepts documented paths and rejects bad ones`,
  () =>
  {
    const state =
      observable(
        { user:
            { name: 'Alice' },
          active: false });

    const unsubscribe =
      observe(state)
      .at('user.name')
      .subscribe(
        (
            value
          ) =>
        {
          const name: string = value;

          assert.equal(
            typeof name,
            'string');
        });

    // @ts-expect-error a path that is not on the model
    observe(state).at('user.nmae');

    // @ts-expect-error the methods conversion adds are not watchable
    observe(state).at('emit');

    assert.equal(
      typeof unsubscribe,
      'function');

    unsubscribe();
  });

test(
  `${TEST_SUITE}: observe refuses a source that does not declare the contract`,
  () =>
  {
    const plain =
      { a: 1 };

    assert.throws(
      () =>
        // @ts-expect-error a plain object is rejected before the runtime sees it
        observe(plain),
      TypeError);
  });

test(
  `${TEST_SUITE}: members keep their declared type, with or without deep`,
  () =>
  {
    type State = {
      user: { name: string; };
      list: Array<{ n: number; }>;
    };

    const create =
      (): State => ({ user:
                        { name: 'Alice' },
                      list:
                        [ { n: 1 } ] });

    // Separate data for each call: conversion grafts onto the target, so a
    // shared member would be converted for both.
    const flat =
      observable(
        create());

    const deep =
      observable(
        create(),
        { deep: true });

    // Only the top-level value is guaranteed to be converted, so both calls
    // describe the same thing: the model with the eventful API on it.
    const sameType: Equals<
      typeof flat,
      typeof deep
    > = true;

    const userIsDeclared: Equals<
      typeof deep.user,
      { name: string; }
    > = true;

    const itemIsDeclared: Equals<
      typeof deep.list[0],
      { n: number; }
    > = true;

    assert.ok(sameType);

    assert.ok(userIsDeclared);

    assert.ok(itemIsDeclared);

    deep.on(
      'change',
      (
          changes
        ) =>
      {
        const first: Change = changes[0];

        assert.equal(
          typeof first.kind,
          'string');
      });

    assert.equal(
      // @ts-expect-error a member is typed as declared, not as converted
      typeof deep.user.on,
      'function'
    );

    // Deep conversion made the member observable at runtime, and the guard is
    // how a caller reaches it.
    assert.ok(
      isObservable(deep.user));

    assert.ok(
      isObservable(deep.list[0]));

    assert.ok(
      !isObservable(flat.user));

    // A member holds the plain value or its observable, so either is accepted.
    deep.user =
      { name: 'Bob' };

    deep.user =
      observable(
        { name: 'Carol' });

    assert.strictEqual(
      deep.user.name,
      'Carol');
  });

test(
  `${TEST_SUITE}: converting an unsupported value has no result type`,
  () =>
  {
    // Converting one of these throws, so the call resolves to never rather
    // than describing a value that is never returned.
    const mapIsNever: Equals<
      Converted<Map<string, number>>,
      never
    > = true;

    // Primitives are boxed.
    const numberIsBoxed: Equals<
      Converted<number>['value'],
      number
    > = true;

    assert.ok(mapIsNever);

    assert.ok(numberIsBoxed);

    assert.throws(
      () =>
        observable(
          new Map() as any),
      TypeError);
  });

test(
  `${TEST_SUITE}: a date, regular expression or function is a boxed value`,
  () =>
  {
    const dateIsBoxed: Equals<
      Converted<Date>['value'],
      Date
    > = true;

    const date =
      new Date(1);

    const boxed =
      observable(date);

    const typedBox: Date = boxed.value;

    assert.ok(dateIsBoxed);

    assert.strictEqual(
      typedBox,
      date);

    // A value is a leaf: a path does not descend into a date's methods.
    type Model = { when: Date; };

    const isLeaf: Equals<
      ObservablePath<Model>,
      'when'
    > = true;

    assert.ok(isLeaf);
  });
