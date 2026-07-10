import test
  from 'node:test';
import assert
  from 'node:assert';

test(
  'index exports expected members',
  async () => {
    const indexModule =
        await import('./index.js');

    assert.ok(
        indexModule.TmpDir);

    assert.ok(
        indexModule.tmpDirFormatMessage);

    assert.ok(
        indexModule.tmpDirThrowErrorFunction);

    assert.ok(
        indexModule.tmpDirConsoleLogFunction);
  });