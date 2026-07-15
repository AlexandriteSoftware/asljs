import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { keyAssert,
         keyGet,
         KeyPath,
         keyPathAssert,
         keyPathValid,
         keyValid,
         keyValueAssert,
         keyValueValid }
  from './keys.js';

const TEST_SUITE = 'keys';

test(
  `${TEST_SUITE}: keyPathValid accepts non-empty string arrays`,
  () =>
  {
    assert.equal(
      keyPathValid(
        ['id']
      ),
      true
    );

    assert.equal(
      keyPathValid(
        ['projectId', 'date']
      ),
      true
    );
  }
);

test(
  `${TEST_SUITE}: keyPathValid rejects empty and blank entries`,
  () =>
  {
    assert.equal(
      keyPathValid([]),
      false
    );

    assert.equal(
      keyPathValid(
        ['']
      ),
      false
    );
  }
);

test(
  `${TEST_SUITE}: keyPathValid accepts a single string`,
  () =>
  {
    assert.equal(
      keyPathValid('id'),
      true
    );
  }
);

test(
  `${TEST_SUITE}: keyPathAssert throws for invalid path`,
  () =>
  {
    assert.throws(
      () => keyPathAssert(''),
      TypeError
    );
  }
);

test(
  `${TEST_SUITE}: keyValueValid accepts IndexedDB key types`,
  () =>
  {
    assert.equal(
      keyValueValid('a'),
      true
    );

    assert.equal(
      keyValueValid(1),
      true
    );

    assert.equal(
      keyValueValid(
        new Date('2026-03-27T00:00:00.000Z')
      ),
      true
    );

    assert.equal(
      keyValueValid(
        new Uint8Array([1, 2, 3])
      ),
      true
    );

    assert.equal(
      keyValueValid(
        ['a', 1]
      ),
      true
    );
  }
);

test(
  `${TEST_SUITE}: keyValueValid rejects invalid IndexedDB key types`,
  () =>
  {
    assert.equal(
      keyValueValid(null),
      false
    );

    assert.equal(
      keyValueValid(undefined),
      false
    );

    assert.equal(
      keyValueValid(
        Number.NaN
      ),
      false
    );

    assert.equal(
      keyValueValid({}),
      false
    );

    assert.equal(
      keyValueValid(
        ['a', undefined]
      ),
      false
    );
  }
);

test(
  `${TEST_SUITE}: keyValueAssert throws for invalid value`,
  () =>
  {
    assert.throws(
      () => keyValueAssert(undefined),
      TypeError
    );
  }
);

test(
  `${TEST_SUITE}: keyGet returns scalar key for single-part keyDef`,
  () =>
  {
    type TestRecord = { id: string; version: string; amount: number; };

    const keyDef: KeyPath<TestRecord> =
      ['id'];

    const record: TestRecord =
      { id: 'a', version: 'v1', amount: 10 };

    assert.equal(
      keyGet(
        keyDef,
        record
      ),
      'a'
    );
  }
);

test(
  `${TEST_SUITE}: keyGet returns composite key for multi-part keyDef`,
  () =>
  {
    type TestRecord = { id: string; version: string; amount: number; };

    const keyDef: KeyPath<TestRecord> =
      ['id', 'version'];

    const record: TestRecord =
      { id: 'a', version: 'v1', amount: 10 };

    assert.deepEqual(
      keyGet(
        keyDef,
        record
      ),
      ['a', 'v1']
    );
  }
);

test(
  `${TEST_SUITE}: keyGet throws when key value is invalid`,
  () =>
  {
    type TestRecord = {
      id: string | undefined;
      version: string;
      amount: number;
    };

    const keyDef: KeyPath<TestRecord> =
      ['id'];

    const record: TestRecord =
      { id: undefined, version: 'v1', amount: 10 };

    assert.throws(
      () =>
        keyGet(
          keyDef,
          record
        ),
      TypeError
    );
  }
);

test(
  `${TEST_SUITE}: keyValid validates single-value keys`,
  () =>
  {
    assert.equal(
      keyValid(
        ['id'],
        'a'
      ),
      true
    );

    assert.equal(
      keyValid(
        ['id'],
        ['a']
      ),
      false
    );
  }
);

test(
  `${TEST_SUITE}: keyValid validates composite keys by length`,
  () =>
  {
    assert.equal(
      keyValid(
        ['id', 'version'],
        ['a', 'v1']
      ),
      true
    );

    assert.equal(
      keyValid(
        ['id', 'version'],
        ['a']
      ),
      false
    );

    assert.equal(
      keyValid(
        ['id', 'version'],
        'a'
      ),
      false
    );
  }
);

test(
  `${TEST_SUITE}: keyAssert throws for invalid key shape`,
  () =>
  {
    assert.throws(
      () =>
        keyAssert(
          ['id', 'version'],
          'a'
        ),
      TypeError
    );
  }
);
