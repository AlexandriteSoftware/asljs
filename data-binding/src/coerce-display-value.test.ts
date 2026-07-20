import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { coerceDisplayValue }
  from './coerce-display-value.js';

const TEST_SUITE =
  'coerce-display-value';

test(
  `${TEST_SUITE}: converts nullish values to empty string`,
  () =>
  {
    assert.equal(
      coerceDisplayValue(null),
      '');

    assert.equal(
      coerceDisplayValue(undefined),
      '');
  });

test(
  `${TEST_SUITE}: converts Date to ISO string`,
  () =>
  {
    const result =
      coerceDisplayValue(
        new Date('2026-01-02T03:04:05.000Z'));

    assert.equal(
      result,
      '2026-01-02T03:04:05.000Z');
  });

test(
  `${TEST_SUITE}: converts scalar values to string`,
  () =>
  {
    assert.equal(
      coerceDisplayValue(10),
      '10');

    assert.equal(
      coerceDisplayValue(true),
      'true');
  });
