import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { readModelPath,
         readModelPathOwner,
         splitPath }
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
  `${TEST_SUITE}: a get method is an ordinary property, not a path reader`,
  () =>
  {
    const model =
      { name: 'Alice',
        get(
        id: string
      ): string
      {
        return `record-${id}`;
      } };

    assert.equal(
      readModelPath(
        model,
        'name'),
      'Alice');

    assert.equal(
      readModelPath(
        model,
        'get'),
      model.get);
  });

test(
  `${TEST_SUITE}: returns undefined for a path that does not resolve`,
  () =>
  {
    for (
      const model of [ {},
                       { missing: null },
                       { missing: 'text' } ]
    ) {
      assert.equal(
        readModelPath(
          model,
          'missing.path'),
        undefined);
    }

    assert.equal(
      readModelPath(
        {},
        ''),
      undefined);
  });

test(
  `${TEST_SUITE}: reads a property of a function, as observe does`,
  () =>
  {
    const format =
      Object.assign(
        () => '',
        { label: 'Format' });

    assert.equal(
      readModelPath(
        { format },
        'format.label'),
      'Format');
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
  `${TEST_SUITE}: owner of a path through a missing object is undefined`,
  () =>
  {
    assert.equal(
      readModelPathOwner(
        {},
        'user.activate'),
      undefined);
  });

test(
  `${TEST_SUITE}: owner ignores a get method on the model`,
  () =>
  {
    const user =
      { activate: () => { } };

    assert.equal(
      readModelPathOwner(
        { user,
          get:
            () => 'not the owner' },
        'user.activate'),
      user);
  });

test(
  `${TEST_SUITE}: splitPath trims segments and gives an empty path none`,
  () =>
  {
    assert.deepEqual(
      splitPath(' user . name '),
      [ 'user',
        'name' ]);

    assert.deepEqual(
      splitPath(''),
      [ ]);
  });

test(
  `${TEST_SUITE}: splitPath rejects an empty segment, as observe().at() does`,
  () =>
  {
    for (const path of [ 'user.',
                         'user..name',
                         '.user' ]) {
      assert.throws(
        () => splitPath(path),
        { name: 'TypeError',
          message:
            `Expect path segments to be non-empty: '${path}'.` });
    }
  });
