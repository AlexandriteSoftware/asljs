import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import test
  from 'node:test';
import { CHECK_CACHE_PATH,
         CheckCache,
         CheckCacheEntry,
         hashRuleContent }
  from './check-cache.js';
import { tmpDirFactory }
  from './testing/tmpDir.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const logger =
  loggerProvider.getLogger('CheckCache');

const ENTRY: CheckCacheEntry =
  { checkedAt:
      '2030-01-01T00:00:00.000Z',
    ruleHash:
      hashRuleContent('Rule.'),
    mode: 'code',
    plugin: 'test',
    version: '1',
    result: 'Fail',
    message: 'Failed.' };

test(
  'RQ136: a missing or unreadable cache file gives an empty cache',
  async () =>
  {
    await using workspace =
      tmpDir();

    const missing =
      await CheckCache.load(
        logger,
        workspace.path);

    assert.equal(
      missing.get(
        'file:A.md',
        'Article_RL1'),
      undefined);

    await workspace.writeText(
      CHECK_CACHE_PATH,
      'not json');

    const unreadable =
      await CheckCache.load(
        logger,
        workspace.path);

    assert.equal(
      unreadable.get(
        'file:A.md',
        'Article_RL1'),
      undefined);
  });

test(
  'RQ136: saved entries load again and entries not kept are dropped',
  async () =>
  {
    await using workspace =
      tmpDir();

    const cache =
      await CheckCache.load(
        logger,
        workspace.path);

    cache.set(
      'file:A.md',
      'Article_RL1',
      ENTRY);

    cache.set(
      'file:Gone.md',
      'Article_RL1',
      ENTRY);

    await cache.save(
      location => location !== 'file:Gone.md');

    const loaded =
      await CheckCache.load(
        logger,
        workspace.path);

    assert.deepEqual(
      loaded.get(
        'file:A.md',
        'Article_RL1'),
      ENTRY);

    assert.equal(
      loaded.get(
        'file:Gone.md',
        'Article_RL1'),
      undefined);

    assert.deepEqual(
      Object.keys(
        JSON.parse(
          await readFile(
            workspace.resolve(CHECK_CACHE_PATH),
            'utf8')).entries),
      [ 'file:A.md' ]);
  });
