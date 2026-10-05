import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { readModelPath,
         readModelPathOwner }
  from './read-model-path.js';

const TEST_SUITE = 'read-model-path';

test(
  `${TEST_SUITE}: reads nested property path`,
  () =>
  {
    const value =
      readModelPath(
        { meta:
            { caption: 'Hi' } },
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
      { get:
          (path: string) => `value:${path}` } as Record<
      string,
      unknown
    >;

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

test(
  `${TEST_SUITE}: owner of a single-segment path is the model`,
  () =>
  {
    const model =
      { save: () => { } };

    assert.equal(
      readModelPathOwner(
        model,
        'save'),
      model);
  });

test(
  `${TEST_SUITE}: owner of a nested path is the object that holds the leaf`,
  () =>
  {
    const user =
      { activate: () => { } };

    assert.equal(
      readModelPathOwner(
        { user },
        'user.activate'),
      user);
  });

test(
  `${TEST_SUITE}: owner of a path through a missing object is null`,
  () =>
  {
    assert.equal(
      readModelPathOwner(
        {},
        'user.activate'),
      null);
  });

test(
  `${TEST_SUITE}: owner is read through get(path) when provided`,
  () =>
  {
    const model =
      { get:
          (path: string) => `value:${path}` } as Record<
      string,
      unknown
    >;

    assert.equal(
      readModelPathOwner(
        model,
        'user.profile.activate'),
      'value:user.profile');
  });
