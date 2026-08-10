import assert
  from 'node:assert';
import test
  from 'node:test';

test(
  'RQ002 index exports expected members',
  async () =>
  {
    const indexModule =
      await import('./index.js');

    assert.ok(
      indexModule.TmpDir);

    assert.ok(
      indexModule.formatMessage);

    assert.ok(
      indexModule.throwOnError);

    assert.ok(
      indexModule.logToConsole);
  });
