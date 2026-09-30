// The sticky put, get and history. Every key belongs to a project, and a project's
// samples live in that project's database. See docs/concept.md section 5.

import fs from 'node:fs';
import path from 'node:path';
import {
  DatabaseSync
} from 'node:sqlite';
import * as config from './config.js';

const schema = fs.readFileSync(
  path.join(import.meta.dirname, 'schema.sql'),
  'utf8'
);

// Size is measured on the data only, as UTF-8 bytes. Keys, timestamps and index
// overhead are not the user's budget to spend.
const sizeOf = value => Buffer.byteLength(value, 'utf8');

// --- connections -----------------------------------------------------------

const prepare = db => ({
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
});

// One connection per database file, opened on first use. Two projects naming the
// same file share one connection, so the store is per file, not per project.
const connections = new Map();

const open = dbPath =>
{
  const current = connections.get(dbPath);
  if (current) {
    return current;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(schema);

  const connection = { db, statements: prepare(db) };
  connections.set(dbPath, connection);
  return connection;
};

/** The statements of the database the key is stored in. */
const statementsFor = key =>
{
  const project = config.projectOf(key);
  if (!project) {
    throw new Error(`no project is configured, so ${key} has nowhere to go`);
  }
  return open(project.db).statements;
};

/** Every configured database, each opened once. */
const openAll = () =>
{
  const opened = new Map();
  for (const project of config.projects()) {
    if (!opened.has(project.db)) {
      opened.set(project.db, open(project.db).statements);
    }
  }
  return [...opened.values()];
};

// --- memory store ----------------------------------------------------------

// Memory is process-local and the key namespace is global, so one map serves every
// project: key -> array of { ts, seen, value, bytes }, newest last.
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
const trimDatabase = (statements, key, policy, now) =>
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
 * Where it lands and how long it survives is the key's counter policy.
 * Returns { changed, ts, seen }.
 */
const put = (key, value, now = Date.now()) =>
{
  const policy = config.policyFor(key);

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

  const statements = statementsFor(key);
  const current = statements.newest.get(key);

  if (current && current.value === value) {
    statements.touch.run(now, current.id);
    trimDatabase(statements, key, policy, now);
    return { changed: false, ts: current.ts, seen: now };
  }

  statements.insert.run(key, now, now, value);
  trimDatabase(statements, key, policy, now);

  return { changed: true, ts: now, seen: now };
};

const get = (key, now = Date.now()) =>
{
  const policy = config.policyFor(key);

  if (policy.store === 'memory') {
    trimMemory(key, policy, now);
    const rows = memory.get(key);
    const current = rows?.[rows.length - 1];
    return current
      ? { ts: current.ts, seen: current.seen, value: current.value }
      : null;
  }

  const statements = statementsFor(key);
  trimDatabase(statements, key, policy, now);
  return statements.newest.get(key) ?? null;
};

const history = (key, { limit = 500, since = 0, now = Date.now() } = {}) =>
{
  const policy = config.policyFor(key);

  if (policy.store === 'memory') {
    trimMemory(key, policy, now);
    return (memory.get(key) ?? [])
      .filter(row => row.ts >= since)
      .slice(-limit)
      .reverse()
      .map(({ ts, seen, value }) => ({ ts, seen, value }));
  }

  const statements = statementsFor(key);
  trimDatabase(statements, key, policy, now);
  return statements.history.all(key, since, limit);
};

/** Every key any configured database holds, plus the in-memory ones. */
const keys = () =>
{
  const all = new Set(memory.keys());
  for (const statements of openAll()) {
    for (const row of statements.keys.all()) {
      all.add(row.key);
    }
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
    trimMemory(key, config.policyFor(key), now);
  }
  for (const statements of openAll()) {
    for (const row of statements.keys.all()) {
      const policy = config.policyFor(row.key);
      if (policy.store === 'database') {
        trimDatabase(statements, row.key, policy, now);
      } else {
        // The key moved to memory since it was last written; its rows are orphans.
        statements.expire.run(row.key, Number.MAX_SAFE_INTEGER);
      }
    }
  }
};

export {
  get,
  history,
  keys,
  openAll,
  put,
  sweep
};
