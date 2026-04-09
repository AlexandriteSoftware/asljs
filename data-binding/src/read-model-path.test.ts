import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    readModelPath
  } from './read-model-path.js';

const CONTEXT_NAME =
  'read-model-path-test';

test(
  `${CONTEXT_NAME}: reads nested property path`,
  () => {
    const value =
      readModelPath(
        { meta: { caption: 'Hi' } },
        'meta.caption');

    assert.equal(value, 'Hi');
  });

test(
  `${CONTEXT_NAME}: uses get(path) when provided`,
  () => {
    const model =
      {
        get: (path: string) =>
          `value:${path}`
      } as Record<string, unknown>;

    const value =
      readModelPath(
        model,
        'name');

    assert.equal(value, 'value:name');
  });

 test(
  `${CONTEXT_NAME}: returns null for missing path`,
  () => {
    const value =
      readModelPath(
        {},
        'missing.path');

    assert.equal(value, null);
  });
