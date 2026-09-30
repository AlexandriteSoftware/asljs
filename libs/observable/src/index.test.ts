import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { asObservable,
         batch,
         combine,
         isObservable,
         observable,
         ObservableObject,
         observe }
  from './index.js';

const TEST_SUITE = 'index';

test(
  `${TEST_SUITE}: exports public api`,
  () =>
  {
    for (
      const exported of [ observable,
                          ObservableObject,
                          observe,
                          combine,
                          batch,
                          isObservable,
                          asObservable ]
    ) {
      assert.equal(
        typeof exported,
        'function');
    }
  });

/**
 * The package root is the surface a caller works against: a converter, a
 * contract guard, a query, and a batch boundary, with nothing injected into the
 * model.
 */
test(
  `${TEST_SUITE}: the root exports compose into a working model`,
  () =>
  {
    const model =
      observable(
        { name: 'Alice',
          active: false });

    assert.equal(
      isObservable(model),
      true);

    const seen: unknown[] = [ ];

    const unsubscribe =
      combine(
        [ observe(model).at('name'),
          observe(model).at('active') ])
      .subscribe(
        value => seen.push(value));

    batch(
      () =>
      {
        model.name = 'Bob';
        model.active = true;
      });

    assert.deepEqual(
      seen,
      [ [ 'Alice',
          false ],
        [ 'Bob',
          true ] ]);

    assert.equal(
      unsubscribe(),
      true);

    // The query is not injected into the model.
    assert.equal(
      (model as any).watch,
      undefined);
  });
