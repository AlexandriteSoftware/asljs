import fs from 'node:fs';
import path from 'node:path';
import {
  DatabaseSync
} from 'node:sqlite';
import * as samples from './samples.js';

const KEY_PATTERN = /^[a-zA-Z0-9_.-]+$/;

const dbPath = process.env.DASH_DB
  || path.join(import.meta.dirname, 'dash.sqlite');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec(fs.readFileSync(path.join(import.meta.dirname, 'schema.sql'), 'utf8'));

const statements = {
  newest: db.prepare(
    'SELECT id, ts, seen, value FROM samples WHERE key = ? ORDER BY ts DESC LIMIT 1'
  ),
  touch: db.prepare('UPDATE samples SET seen = ? WHERE id = ?'),
  insert: db.prepare(
    'INSERT INTO samples (key, ts, seen, value) VALUES (?, ?, ?, ?)'
  ),
  history: db.prepare(
    'SELECT ts, seen, value FROM samples WHERE key = ? AND ts >= ? ORDER BY ts DESC LIMIT ?'
  ),
  expire: db.prepare('DELETE FROM samples WHERE key = ? AND seen < ?'),
  trimCount: db.prepare(
    'DELETE FROM samples WHERE key = ? AND id NOT IN'
      + ' (SELECT id FROM samples WHERE key = ? ORDER BY ts DESC LIMIT ?)'
  ),
  sizes: db.prepare(
    'SELECT id, length(CAST(value AS BLOB)) AS bytes FROM samples WHERE key = ? ORDER BY ts DESC'
  ),
  deleteById: db.prepare('DELETE FROM samples WHERE id = ?'),
  keys: db.prepare('SELECT DISTINCT key FROM samples ORDER BY key')
};

const isKey = key => typeof key === 'string' && KEY_PATTERN.test(key);

// Size is measured on the data only, as UTF-8 bytes. Keys, timestamps and index
// overhead are not the user's budget to spend.
const sizeOf = value => Buffer.byteLength(value, 'utf8');

// --- memory store ----------------------------------------------------------

// key -> array of { ts, seen, value, bytes }, newest last.
const memory = new Map();

const memoryRows = key =>
{
  let rows = memory.get(key);
  if (!rows) {
    rows = [];
    memory.set(key, rows);
  }
  return rows;
};

/** Apply retention, count and quota to one in-memory key. Oldest goes first. */
const trimMemory = (key, policy, now) =>
{
  const rows = memory.get(key);
  if (!rows) {
    return;
  }

  const cutoff = now - policy.retentionMs;
  let start = 0;
  let bytes = 0;

  while (start < rows.length && rows[start].seen < cutoff) {
    start += 1;
  }
  if (rows.length - start > policy.count) {
    start = rows.length - policy.count;
  }
  // The newest sample is the key's current value, so the quota never evicts it;
  // an oversized value costs its own size and leaves no room for history.
  for (let index = rows.length - 1; index >= start; index -= 1) {
    bytes += rows[index].bytes;
    if (bytes > policy.quotaBytes && index < rows.length - 1) {
      start = index + 1;
      break;
    }
  }

  if (start > 0) {
    rows.splice(0, start);
  }
  if (rows.length === 0) {
    memory.delete(key);
  }
};

// --- database store --------------------------------------------------------

/** Apply retention, count and quota to one database key. Oldest goes first. */
const trimDatabase = (key, policy, now) =>
{
  statements.expire.run(key, now - policy.retentionMs);
  statements.trimCount.run(key, key, policy.count);

  // Newest first, so the rows that survive the quota are the ones worth keeping.
  // As in memory, the newest row is never evicted by the quota.
  const rows = statements.sizes.all(key);
  let bytes = 0;
  let over = false;
  rows.forEach((row, index) =>
  {
    bytes += row.bytes;
    if (over || (bytes > policy.quotaBytes && index > 0)) {
      over = true;
      statements.deleteById.run(row.id);
    }
  });
};

// --- api -------------------------------------------------------------------

/**
 * Store a value. Sticky: an unchanged value bumps `seen` instead of adding a row.
 * Where it lands and how long it survives is the key's samples.json policy.
 * Returns { changed, ts, seen }.
 */
const put = (key, value, now = Date.now()) =>
{
  const policy = samples.policyFor(key);

  if (policy.store === 'memory') {
    const rows = memoryRows(key);
    const current = rows[rows.length - 1];

    if (current && current.value === value) {
      current.seen = now;
      trimMemory(key, policy, now);
      return { changed: false, ts: current.ts, seen: now };
    }

    rows.push({ ts: now, seen: now, value, bytes: sizeOf(value) });
    trimMemory(key, policy, now);
    return { changed: true, ts: now, seen: now };
  }

  const current = statements.newest.get(key);

  if (current && current.value === value) {
    statements.touch.run(now, current.id);
    trimDatabase(key, policy, now);
    return { changed: false, ts: current.ts, seen: now };
  }

  statements.insert.run(key, now, now, value);
  trimDatabase(key, policy, now);

  return { changed: true, ts: now, seen: now };
};

const get = (key, now = Date.now()) =>
{
  const policy = samples.policyFor(key);

  if (policy.store === 'memory') {
    trimMemory(key, policy, now);
    const rows = memory.get(key);
    const current = rows?.[rows.length - 1];
    return current
      ? { ts: current.ts, seen: current.seen, value: current.value }
      : null;
  }

  trimDatabase(key, policy, now);
  return statements.newest.get(key) ?? null;
};

const history = (key, { limit = 500, since = 0, now = Date.now() } = {}) =>
{
  const policy = samples.policyFor(key);

  if (policy.store === 'memory') {
    trimMemory(key, policy, now);
    return (memory.get(key) ?? [])
      .filter(row => row.ts >= since)
      .slice(-limit)
      .reverse()
      .map(({ ts, seen, value }) => ({ ts, seen, value }));
  }

  trimDatabase(key, policy, now);
  return statements.history.all(key, since, limit);
};

const keys = () =>
{
  const all = new Set(statements.keys.all().map(row => row.key));
  for (const key of memory.keys()) {
    all.add(key);
  }
  return [...all].sort();
};

/**
 * Enforce every key's policy, whether or not it was written to. Expiry is a
 * clock event, not a write event: a key nobody puts must still age out.
 */
const sweep = (now = Date.now()) =>
{
  for (const key of [...memory.keys()]) {
    trimMemory(key, samples.policyFor(key), now);
  }
  for (const row of statements.keys.all()) {
    const policy = samples.policyFor(row.key);
    if (policy.store === 'database') {
      trimDatabase(row.key, policy, now);
    } else {
      // The key moved to memory since it was last written; its rows are orphans.
      statements.expire.run(row.key, Number.MAX_SAFE_INTEGER);
    }
  }
};

export {
  db,
  get,
  history,
  isKey,
  keys,
  put,
  sweep
};
