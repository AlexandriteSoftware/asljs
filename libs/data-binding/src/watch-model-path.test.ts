import { observable }
  from 'asljs-observable';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { watchModelPath }
  from './watch-model-path.js';

const TEST_SUITE = 'watch-model-path';

test(
  `${TEST_SUITE}: calls back once for a plain model`,
  () =>
  {
    const model: Record<string, unknown> =
      { name: 'Alice' };

    let calls = 0;

    const dispose =
      watchModelPath(
        model,
        'name',
        () => calls++);

    model.name = 'Bob';

    dispose();

    assert.equal(
      calls,
      1);
  });

test(
  `${TEST_SUITE}: calls back on change of an observable model until disposed`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } },
        { deep: true });

    let calls = 0;

    const dispose =
      watchModelPath(
        model,
        'user.name',
        () => calls++);

    model.user.name = 'Bob';

    model.user =
      observable(
        { name: 'Carol' });

    dispose();

    model.user.name = 'Dan';

    assert.equal(
      calls,
      3);
  });

test(
  `${TEST_SUITE}: stays silent when the value at the path does not change`,
  () =>
  {
    const model =
      observable(
        { name: 'Alice',
          other: 1 });

    let calls = 0;

    watchModelPath(
      model,
      'name',
      () => calls++);

    model.other = 2;

    assert.equal(
      calls,
      1);
  });

test(
  `${TEST_SUITE}: the disposer reports once, for a plain and an observable model`,
  () =>
  {
    for (
      const model of [ { name: 'plain' },
                       observable(
                         { name: 'observable' }) ]
    ) {
      const dispose =
        watchModelPath(
          model,
          'name',
          () => { });

      assert.equal(
        dispose(),
        true);

      assert.equal(
        dispose(),
        false);
    }
  });

test(
  `${TEST_SUITE}: calls back with the value at the path, undefined where it does not resolve`,
  () =>
  {
    const model =
      observable(
        { user:
            { name: 'Alice' } as { name: string; } | null },
        { deep: true });

    const values: unknown[] = [ ];

    watchModelPath(
      model,
      'user.name',
      value => values.push(value));

    model.user = null;

    const plainValues: unknown[] = [ ];

    for (const path of [ 'user.name',
                         'user.missing' ]) {
      watchModelPath(
        { user:
            { name: 'Alice' } },
        path,
        value => plainValues.push(value));
    }

    assert.deepEqual(
      values,
      [ 'Alice',
        undefined ]);

    assert.deepEqual(
      plainValues,
      [ 'Alice',
        undefined ]);
  });
