import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Observable,
         ObservableGlobalOptions,
         ObservableOptions,
         ObservableTraceFn,
         ObservableWatchFn,
         WatchedValues }
  from './types.js';

const TEST_SUITE = 'types';

test(
  `${TEST_SUITE}: compile-time shapes can be referenced`,
  () =>
  {
    const options: ObservableOptions =
      { shallow: true, trace: null };

    const globalOptions: ObservableGlobalOptions =
      { trace: null };

    const traceFn: ObservableTraceFn =
      (_object, _action, _payload) =>
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
      ['Alice', 7];

    assert.ok(
      options.shallow
    );

    assert.equal(
      globalOptions.trace,
      null
    );

    assert.equal(
      typeof traceFn,
      'function'
    );

    assert.equal(
      typeof watchFn,
      'function'
    );

    assert.equal(
      boxed,
      null
    );

    assert.deepEqual(
      picked,
      ['Alice', 7]
    );
  }
);
