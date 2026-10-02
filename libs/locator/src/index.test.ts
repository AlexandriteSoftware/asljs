import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { GitIgnore,
         type Location,
         type LocationFilter,
         LocationResolver,
         toPatterns,
         toPosixPath }
  from './index.js';

const TEST_SUITE = 'index';

test(
  `${TEST_SUITE}: exports public api`,
  (): void =>
  {
    assert.equal(
      typeof LocationResolver,
      'function');

    assert.equal(
      typeof GitIgnore,
      'function');

    assert.equal(
      typeof toPatterns,
      'function');

    assert.equal(
      typeof toPosixPath,
      'function');
  });

test(
  `${TEST_SUITE}: exports the location types`,
  (): void =>
  {
    const filter: LocationFilter =
      { name: 'GitIgnore' };

    const location: Location =
      { patterns:
          [ '**/*.md' ],
        exclude:
          [ 'build/**' ],
        filters:
          [ filter ] };

    assert.deepEqual(
      toPatterns(location),
      [ '**/*.md' ]);
  });
