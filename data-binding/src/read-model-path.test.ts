import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { readModelPath }
  from './read-model-path.js';

const TEST_SUITE =
  'read-model-path';

test(
  `${TEST_SUITE}: reads nested property path`,
  () =>
  {
    const value =
      readModelPath(
        { meta: { caption: 'Hi' } },
        'meta.caption');

    assert.equal(
      value,
      'Hi');
  });

test(
  `${TEST_SUITE}: uses get(path) when provided`,
  () =>
  {
    const model =
      {
      get: (path: string) => `value:${path}`
    } as Record<string, unknown>;

    const value =
      readModelPath(
        model,
        'name');

    assert.equal(
      value,
      'value:name');
  });

test(
  `${TEST_SUITE}: returns null for missing path`,
  () =>
  {
    const value =
      readModelPath(
        {},
        'missing.path');

    assert.equal(
      value,
      null);
  });
