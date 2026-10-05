import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { TmpGlobals }
  from './tmp-globals.js';

const NAME =
  '__asljsTestingTmpGlobal';

const globals =
  globalThis as unknown as Record<string, unknown>;

test.afterEach(
  () =>
  {
    Reflect.deleteProperty(
      globalThis,
      NAME);
  });

test(
  'RQ004 TmpGlobals replaces a property and restores its previous value',
  () =>
  {
    globals[NAME] = 'before';

    const tmpGlobals =
      new TmpGlobals(
        { [NAME]: 'during' });

    assert.equal(
      globals[NAME],
      'during');

    tmpGlobals.restore();

    assert.equal(
      globals[NAME],
      'before');
  });

test(
  'RQ004 TmpGlobals removes a property that did not exist before',
  () =>
  {
    const tmpGlobals =
      new TmpGlobals(
        { [NAME]: 'during' });

    tmpGlobals.restore();

    assert.equal(
      Object.hasOwn(
        globalThis,
        NAME),
      false);
  });

test(
  'RQ004 TmpGlobals restores a getter with its descriptor',
  () =>
  {
    Object.defineProperty(
      globalThis,
      NAME,
      { get: () => 'from getter',
        configurable: true });

    const tmpGlobals =
      new TmpGlobals(
        { [NAME]: 'during' });

    assert.equal(
      globals[NAME],
      'during');

    tmpGlobals.restore();

    assert.equal(
      globals[NAME],
      'from getter');

    assert.equal(
      typeof Object.getOwnPropertyDescriptor(
        globalThis,
        NAME)?.get,
      'function');
  });

test(
  'RQ004 TmpGlobals restores at the end of a using block',
  () =>
  {
    {
      using tmpGlobals =
        new TmpGlobals(
          { [NAME]: 'during' });

      assert.equal(
        globals[NAME],
        'during');
    }

    assert.equal(
      Object.hasOwn(
        globalThis,
        NAME),
      false);
  });

test(
  'RQ004 TmpGlobals.set keeps the first previous value',
  () =>
  {
    globals[NAME] = 'before';

    const tmpGlobals =
      new TmpGlobals(
        { [NAME]: 'during' });

    tmpGlobals.set(
      NAME,
      'later');

    assert.equal(
      globals[NAME],
      'later');

    tmpGlobals.restore();

    assert.equal(
      globals[NAME],
      'before');
  });

test(
  'RQ004 TmpGlobals.restore reports whether it did anything, and set throws after it',
  () =>
  {
    const tmpGlobals =
      new TmpGlobals(
        { [NAME]: 'during' });

    assert.equal(
      tmpGlobals.restore(),
      true);

    assert.equal(
      tmpGlobals.restore(),
      false);

    assert.throws(
      () =>
        tmpGlobals.set(
          NAME,
          'late'),
      /already been restored/);
  });
