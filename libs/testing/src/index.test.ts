import assert
  from 'node:assert/strict';
import test
  from 'node:test';

test(
  'RQ002 index exports expected members',
  async () =>
  {
    const indexModule =
      await import('./index.js');

    assert.deepEqual(
      Object.keys(indexModule).sort(),
      [ 'TmpEnv',
        'TmpGlobals',
        'createTestLoggerProvider',
        'flushMicrotasks',
        'waitFor' ]);
  });
