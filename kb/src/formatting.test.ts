import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { filterStringOption,
         splitCommaSeparatedOption,
         toPosixPath }
  from './formatting.js';

test(
  'toPosixPath converts backslashes',
  () =>
  {
    assert.equal(
      toPosixPath(
        'notes\\daily\\today.md'),
      'notes/daily/today.md');
  });

test(
  'filterStringOption trims and rejects non-strings',
  () =>
  {
    assert.equal(
      filterStringOption('  value  '),
      'value');

    assert.equal(
      filterStringOption(undefined),
      '');

    assert.equal(
      filterStringOption(42),
      '');
  });

test(
  'splitCommaSeparatedOption drops empty entries',
  () =>
  {
    assert.deepEqual(
      splitCommaSeparatedOption(
        ' one , two ,, three '),
      [ 'one',
        'two',
        'three' ]);

    assert.deepEqual(
      splitCommaSeparatedOption(''),
      [ ]);

    assert.deepEqual(
      splitCommaSeparatedOption(null),
      [ ]);
  });
