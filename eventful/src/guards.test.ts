import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { eventNameTypeGuard,
         functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';

const TEST_SUITE = 'guards';

test(
  `${TEST_SUITE}: eventNameTypeGuard accepts string and symbol`,
  () =>
  {
    assert.doesNotThrow(
      () => eventNameTypeGuard('event')
    );

    assert.doesNotThrow(
      () =>
        eventNameTypeGuard(
          Symbol('event')
        )
    );
  }
);

test(
  `${TEST_SUITE}: eventNameTypeGuard throws for invalid values`,
  () =>
  {
    assert.throws(
      () => eventNameTypeGuard(42),
      TypeError
    );

    assert.throws(
      () => eventNameTypeGuard(null),
      TypeError
    );
  }
);

test(
  `${TEST_SUITE}: isFunction returns expected result`,
  () =>
  {
    assert.equal(
      isFunction(
        () =>
        {}
      ),
      true
    );

    assert.equal(
      isFunction({}),
      false
    );
  }
);

test(
  `${TEST_SUITE}: isObject returns expected result`,
  () =>
  {
    assert.equal(
      isObject(
        { key: 'value' }
      ),
      true
    );

    assert.equal(
      isObject(null),
      false
    );

    assert.equal(
      isObject(
        () =>
        {}
      ),
      false
    );
  }
);

test(
  `${TEST_SUITE}: functionTypeGuard validates value`,
  () =>
  {
    assert.doesNotThrow(
      () =>
        functionTypeGuard(
          () =>
          {}
        )
    );

    assert.throws(
      () => functionTypeGuard('nope'),
      TypeError
    );
  }
);
