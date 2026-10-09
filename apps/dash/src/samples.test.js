import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_POLICY,
  parseAmount,
  parsePolicy
} from './samples.js';

const SECONDS = { s: 1, m: 60, h: 3600 };

test('parseAmount reads a number, a case-insensitive suffix and products', () =>
{
  assert.equal(parseAmount('45', SECONDS, 'retention'), 45);
  assert.equal(parseAmount('24h', SECONDS, 'retention'), 24 * 3600);
  assert.equal(parseAmount('24H', SECONDS, 'retention'), 24 * 3600);
  assert.equal(parseAmount('90*24h', SECONDS, 'retention'), 90 * 24 * 3600);
  assert.equal(parseAmount(' 2 * 1.5m ', SECONDS, 'retention'), 180);
  assert.equal(parseAmount('1.9', SECONDS, 'retention'), 1);
});

test('parseAmount rejects a bad number, an unknown unit and anything not above zero', () =>
{
  assert.throws(
    () => parseAmount('abc', SECONDS, 'retention'),
    /bad retention "abc"/
  );
  assert.throws(
    () => parseAmount('5d', SECONDS, 'retention'),
    /unknown retention unit "d" in "5d"/
  );
  assert.throws(
    () => parseAmount('0', SECONDS, 'retention'),
    /retention must be greater than zero, got "0"/
  );
  assert.throws(
    () => parseAmount('-1h', SECONDS, 'retention'),
    /bad retention/
  );
});

test('parsePolicy reads the store, retention, count and quota', () =>
{
  assert.deepEqual(parsePolicy('memory, 24h, 1000, 10Mb'), {
    store: 'memory',
    retentionMs: 24 * 3600 * 1000,
    count: 1000,
    quotaBytes: 10 * 1024 ** 2
  });

  assert.deepEqual(parsePolicy('Database, 30s, 2k, 2*512Kb'), {
    store: 'database',
    retentionMs: 30000,
    count: 2000,
    quotaBytes: 1024 ** 2
  });

  assert.equal(parsePolicy('memory, 1h, 2M, 1Kb').count, 2e6);

  assert.deepEqual(parsePolicy('database, 1m, 1G, 1gb'), {
    store: 'database',
    retentionMs: 60000,
    count: 1e9,
    quotaBytes: 1024 ** 3
  });
});

test('parsePolicy defaults to a bounded database policy', () =>
{
  assert.deepEqual(parsePolicy(DEFAULT_POLICY), {
    store: 'database',
    retentionMs: 90 * 24 * 3600 * 1000,
    count: 100000,
    quotaBytes: 100 * 1024 ** 2
  });
});

test('parsePolicy rejects a policy that is not four fields, an unknown store, and a zero limit', () =>
{
  assert.throws(() => parsePolicy(5), /policy must be a string/);
  assert.throws(
    () => parsePolicy('memory, 24h, 1000'),
    /expected "<store>, <retention>, <count>, <quota>"/
  );
  assert.throws(
    () => parsePolicy('disk, 24h, 1000, 10Mb'),
    /unknown store "disk", expected memory or database/
  );
  assert.throws(
    () => parsePolicy('memory, 0, 0, 0'),
    /retention must be greater than zero/
  );
  assert.throws(
    () => parsePolicy('memory, 1h, 1000, 10Tb'),
    /unknown quota unit "Tb"/
  );
});
