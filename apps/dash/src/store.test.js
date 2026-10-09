import {
  TmpDir
} from 'asljs-tmpdir';
import assert from 'node:assert/strict';
import {
  DatabaseSync
} from 'node:sqlite';
import test from 'node:test';
import * as config from './config.js';
import * as store from './store.js';

const HOUR = 3600 * 1000;

/**
 * Loads one project whose database is in `dir`, with these counters. Every test
 * uses keys of its own: the memory store and the connections are module state.
 */
const project = async (t, dir, counters, samples) =>
{
  const file = await dir.writeText(
    'dash.config.json',
    JSON.stringify({ project: 'test', db: 'test.sqlite', samples, counters })
  );
  t.mock.method(console, 'error', () =>
  {});
  const loaded = config.load(['--config', file]);
  assert.deepEqual(loaded.errors, []);
};

const values = rows => rows.map(row => row.value);

/**
 * A folder removed after the test, once its databases are closed: an open SQLite
 * file cannot be deleted on Windows.
 */
const tmpDir = t =>
{
  const dir = new TmpDir();
  t.after(async () =>
  {
    store.close();
    await dir[Symbol.asyncDispose]();
  });
  return dir;
};

for (const kind of ['database', 'memory']) {
  test(`put is sticky in ${kind}: an unchanged value bumps seen, a changed one adds a sample`, async t =>
  {
    const dir = tmpDir(t);
    const key = `sticky.${kind}`;
    await project(t, dir, { [key]: { samples: `${kind}, 24h, 100, 1Mb` } });

    assert.deepEqual(store.put(key, '41', 1000), { changed: true, ts: 1000, seen: 1000 });
    assert.deepEqual(store.put(key, '41', 2000), { changed: false, ts: 1000, seen: 2000 });
    assert.deepEqual(store.put(key, '42', 3000), { changed: true, ts: 3000, seen: 3000 });

    assert.deepEqual(store.get(key, 3000), { ts: 3000, seen: 3000, value: '42' });
    // SQLite rows have a null prototype; what counts is their fields.
    assert.deepEqual(store.history(key, { now: 3000 }).map(row => ({ ...row })), [
      { ts: 3000, seen: 3000, value: '42' },
      { ts: 1000, seen: 2000, value: '41' }
    ]);
  });

  test(`history in ${kind} is newest first, from since, at most limit`, async t =>
  {
    const dir = tmpDir(t);
    const key = `history.${kind}`;
    await project(t, dir, { [key]: { samples: `${kind}, 24h, 100, 1Mb` } });

    for (let index = 1; index <= 5; index += 1) {
      store.put(key, String(index), index * 1000);
    }

    assert.deepEqual(values(store.history(key, { now: 5000 })), ['5', '4', '3', '2', '1']);
    assert.deepEqual(values(store.history(key, { limit: 2, now: 5000 })), ['5', '4']);
    assert.deepEqual(values(store.history(key, { since: 3000, now: 5000 })), ['5', '4', '3']);
  });

  test(`${kind} keeps at most count samples and drops the oldest first`, async t =>
  {
    const dir = tmpDir(t);
    const key = `count.${kind}`;
    await project(t, dir, { [key]: { samples: `${kind}, 24h, 3, 1Mb` } });

    for (let index = 1; index <= 5; index += 1) {
      store.put(key, String(index), index * 1000);
    }

    assert.deepEqual(values(store.history(key, { now: 5000 })), ['5', '4', '3']);
  });

  test(`${kind} expires a sample by when it was last seen, not when it first appeared`, async t =>
  {
    const dir = tmpDir(t);
    const key = `retention.${kind}`;
    await project(t, dir, { [key]: { samples: `${kind}, 1h, 100, 1Mb` } });

    store.put(key, 'old', 0);
    store.put(key, 'steady', 1000);
    store.put(key, 'steady', HOUR);

    // `old` was last seen at 0, `steady` at one hour: only `old` has expired.
    assert.deepEqual(values(store.history(key, { now: HOUR + 1000 })), ['steady']);
    assert.equal(store.get(key, 3 * HOUR), null);
  });

  test(`${kind} keeps the values within the quota, but never evicts the newest`, async t =>
  {
    const dir = tmpDir(t);
    const key = `quota.${kind}`;
    await project(t, dir, { [key]: { samples: `${kind}, 24h, 100, 10b` } });

    store.put(key, 'aaaa', 1000);
    store.put(key, 'bbbb', 2000);
    store.put(key, 'cccc', 3000);
    assert.deepEqual(values(store.history(key, { now: 3000 })), ['cccc', 'bbbb']);

    // Larger than the whole quota: it is the current value, so it stays alone.
    store.put(key, 'x'.repeat(20), 4000);
    assert.deepEqual(values(store.history(key, { now: 4000 })), ['x'.repeat(20)]);

    // Size is counted in UTF-8 bytes: three two-byte characters are six bytes.
    store.put(key, 'ééé', 5000);
    store.put(key, 'ëëë', 6000);
    assert.deepEqual(values(store.history(key, { now: 6000 })), ['ëëë']);
  });
}

test('a key no counter declares is stored in the first project with the project policy', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, {}, 'database, 24h, 2, 1Mb');

  store.put('undeclared.key', 'a', 1000);
  store.put('undeclared.key', 'b', 2000);
  store.put('undeclared.key', 'c', 3000);

  assert.deepEqual(values(store.history('undeclared.key', { now: 3000 })), ['c', 'b']);
  assert.ok(store.keys().includes('undeclared.key'));
});

test('get and history of a key never written are null and empty', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, { 'never.memory': { samples: 'memory, 1h, 1, 1Kb' } });

  assert.equal(store.get('never.written', 1000), null);
  assert.deepEqual(store.history('never.written', { now: 1000 }), []);
  assert.equal(store.get('never.memory', 1000), null);
});

test('keys lists the keys of every configured database and of memory', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, {
    'keys.db': {},
    'keys.mem': { samples: 'memory, 1h, 10, 1Kb' }
  });

  store.put('keys.db', '1', Date.now());
  store.put('keys.mem', '1', Date.now());

  const keys = store.keys();
  assert.ok(keys.includes('keys.db'));
  assert.ok(keys.includes('keys.mem'));
  assert.deepEqual(keys, [...keys].sort());
});

test('sweep ages out a key nobody writes, in both stores', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, {
    'sweep.db': { samples: 'database, 1h, 10, 1Kb' },
    'sweep.mem': { samples: 'memory, 1h, 10, 1Kb' }
  });

  store.put('sweep.db', '1', 0);
  store.put('sweep.mem', '1', 0);

  store.sweep(2 * HOUR);

  assert.ok(!store.keys().includes('sweep.db'));
  assert.ok(!store.keys().includes('sweep.mem'));
});

test('sweep drops the database samples of a key whose policy moved to memory', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, { 'moved.key': { samples: 'database, 24h, 10, 1Kb' } });

  store.put('moved.key', 'on disk', 1000);

  await project(t, dir, { 'moved.key': { samples: 'memory, 24h, 10, 1Kb' } });
  store.sweep(2000);

  await project(t, dir, { 'moved.key': { samples: 'database, 24h, 10, 1Kb' } });
  assert.equal(store.get('moved.key', 3000), null);
});

test('close closes every database, and the next use opens it again', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, { 'close.key': {} });

  store.put('close.key', 'kept', 1000);
  store.close();

  assert.equal(store.get('close.key', 1000).value, 'kept');
});

test('openAll opens each database once, even when two projects name the same file', async t =>
{
  const dir = tmpDir(t);
  const first = await dir.writeText(
    'one.json',
    JSON.stringify({ project: 'one', db: 'shared.sqlite' })
  );
  const second = await dir.writeText(
    'two.json',
    JSON.stringify({ project: 'two', db: 'shared.sqlite', counters: { 'two.key': {} } })
  );
  t.mock.method(console, 'error', () =>
  {});
  config.load(['--config', first, '--config', second]);

  assert.equal(store.openAll().length, 1);

  store.put('two.key', 'shared', 1000);
  assert.equal(store.get('two.key', 1000).value, 'shared');
});

test('database limits apply on write, and memory samples never reach the database', async t =>
{
  const dir = tmpDir(t);
  await project(t, dir, {
    'write.db': { samples: 'database, 24h, 2, 1Mb' },
    'write.mem': { samples: 'memory, 24h, 10, 1Mb' }
  });

  for (const value of ['1', '2', '3']) {
    store.put('write.db', value, Number(value) * 1000);
    store.put('write.mem', value, Number(value) * 1000);
  }
  store.close();

  // Read the file itself, so no read through the store trims it first.
  const db = new DatabaseSync(dir.resolve('test.sqlite'));
  try {
    assert.deepEqual(
      db.prepare('SELECT key, value FROM samples ORDER BY ts').all().map(row => [row.key, row.value]),
      [['write.db', '2'], ['write.db', '3']]
    );
  } finally {
    db.close();
  }
});

test('a key is stored in the database of the project whose config declares it', async t =>
{
  const dir = tmpDir(t);
  const first = await dir.writeText(
    'one.json',
    JSON.stringify({ project: 'one', db: 'one.sqlite' })
  );
  const second = await dir.writeText(
    'two.json',
    JSON.stringify({ project: 'two', db: 'two.sqlite', counters: { 'own.key': {} } })
  );
  t.mock.method(console, 'error', () =>
  {});
  config.load(['--config', first, '--config', second]);

  store.put('own.key', 'mine', 1000);
  store.put('loose.key', 'first', 1000);

  const keys = store.keys();
  assert.ok(keys.includes('own.key') && keys.includes('loose.key'));
  store.close();

  const keysIn = file =>
  {
    const db = new DatabaseSync(dir.resolve(file));
    try {
      return db.prepare('SELECT DISTINCT key FROM samples').all().map(row => row.key);
    } finally {
      db.close();
    }
  };

  assert.deepEqual(keysIn('two.sqlite'), ['own.key']);
  assert.deepEqual(keysIn('one.sqlite'), ['loose.key']);
});
