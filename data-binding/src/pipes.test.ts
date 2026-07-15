import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { mergePipes }
  from './pipes.js';

const TEST_SUITE = 'pipes';

test(
  `${TEST_SUITE}: supports upper lower and default`,
  () =>
  {
    const pipes =
      mergePipes({});

    assert.equal(
      pipes.upper('abc'),
      'ABC'
    );

    assert.equal(
      pipes.lower('ABC'),
      'abc'
    );

    assert.equal(
      pipes.default(
        '',
        'N/A'
      ),
      'N/A'
    );

    assert.equal(
      pipes.default(
        null,
        'N/A'
      ),
      null
    );

    assert.equal(
      pipes.default(
        undefined,
        'N/A'
      ),
      undefined
    );
  }
);

test(
  `${TEST_SUITE}: preserves nullish values in built-in pipes`,
  () =>
  {
    const pipes =
      mergePipes({});

    assert.equal(
      pipes.string(null),
      null
    );

    assert.equal(
      pipes.upper(undefined),
      undefined
    );

    assert.equal(
      pipes.number(null),
      null
    );

    assert.equal(
      pipes.currency(
        undefined,
        'GBP'
      ),
      undefined
    );

    assert.equal(
      pipes.fixed(
        null,
        '2'
      ),
      null
    );

    assert.equal(
      pipes.date(
        undefined,
        'yyyy-MM-dd'
      ),
      undefined
    );

    assert.equal(
      pipes.datetime(
        null,
        'short'
      ),
      null
    );

    assert.equal(
      pipes.json(
        undefined,
        '2'
      ),
      undefined
    );
  }
);

test(
  `${TEST_SUITE}: supports fixed and number formatting`,
  () =>
  {
    const pipes =
      mergePipes({});

    assert.equal(
      pipes.fixed(
        12.345,
        '2'
      ),
      '12.35'
    );

    assert.equal(
      pipes.number(1234.5),
      '1,234.5'
    );
  }
);

test(
  `${TEST_SUITE}: supports currency and date formatting`,
  () =>
  {
    const pipes =
      mergePipes({});

    assert.match(
      String(
        pipes.currency(
          12.5,
          'GBP'
        )
      ),
      /\u00A3|GBP/
    );

    assert.equal(
      pipes.date(
        '2026-02-03',
        'yyyy-MM-dd'
      ),
      '2026-02-03'
    );
  }
);

test(
  `${TEST_SUITE}: supports custom pipes overriding built-ins`,
  () =>
  {
    const pipes =
      mergePipes(
        {
        pipes: {
          upper: value => `custom:${value}`
        }
      });

    assert.equal(
      pipes.upper('x'),
      'custom:x'
    );
  }
);
