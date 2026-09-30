import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Change,
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

    type BoxedNumber = Converted<number>;

    const boxed: BoxedNumber | null = null;

    assert.ok(
      options.shallow);

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
      };

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
  `${TEST_SUITE}: nested members are described as conversion leaves them`,
  () =>
  {
    const state =
      observable(
        { user:
            { name: 'Alice',
              address:
                { city: 'London' } },
          list:
            [ { n: 1 } ] });

    // Conversion is deep, so nested members carry the eventful API and no
    // cast or non-null assertion is needed to reach it.
    state.user.on(
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

    state.user.address.on(
      'change',
      () => { });

    state.list[0].on(
      'change',
      () => { });

    // A member of an observable holds an observable, so a replacement is
    // wrapped rather than assigned plain.
    state.user =
      observable(
        { name: 'Bob',
          address:
            { city: 'Paris' } });

    state.user.address =
      observable(
        { city: 'Rome' });

    assert.strictEqual(
      state.user.address.city,
      'Rome');
  });

test(
  `${TEST_SUITE}: converting an unsupported value has no result type`,
  () =>
  {
    // Converting one of these throws, so the call resolves to never rather
    // than describing a value that is never returned.
    const dateIsNever: Equals<
      Converted<Date>,
      never
    > = true;

    const mapIsNever: Equals<
      Converted<Map<string, number>>,
      never
    > = true;

    // Primitives are still boxed.
    const numberIsBoxed: Equals<
      Converted<number>['value'],
      number
    > = true;

    assert.ok(dateIsNever);

    assert.ok(mapIsNever);

    assert.ok(numberIsBoxed);

    assert.throws(
      () =>
        observable(
          new Date() as any),
      TypeError);
  });
