// Per-key sample persistence policy. See docs/concept.md section 5.
//
// samples.json holds one line per key:
//
//     "ping.gw": "memory, 24h, 1000, 10Mb"
//                 where,  retention, count, quota
//
// All four fields are required and must be positive. There is no unlimited option:
// every key is bounded in time, in record count and in bytes.

import fs from 'node:fs';
import path from 'node:path';

const configPath = process.env.DASH_SAMPLES
  || path.join(import.meta.dirname, 'samples.json');

const DEFAULT_POLICY = 'database, 90*24h, 100k, 100Mb';

const STORES = new Set(['memory', 'database']);

// Suffix -> multiplier, matched case-insensitively, longest suffix first.
const SECONDS = { s: 1, m: 60, h: 3600 };
const COUNTS = { k: 1e3, m: 1e6, g: 1e9 };
const BYTES = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };

/**
 * One number with an optional unit suffix, or a product of them: "24h", "90*24h", "100k".
 * The suffix may sit on any factor; factors without one are plain multipliers.
 */
const parseAmount = (text, units, what) =>
{
  const factors = String(text).trim().split('*');
  let total = 1;

  for (const factor of factors) {
    const match = /^\s*(\d+(?:\.\d+)?)\s*([a-z]*)\s*$/i.exec(factor);
    if (!match) {
      throw new Error(`bad ${what} "${text}"`);
    }

    const suffix = match[2].toLowerCase();
    if (suffix !== '' && !(suffix in units)) {
      throw new Error(`unknown ${what} unit "${match[2]}" in "${text}"`);
    }

    total *= Number(match[1]) * (suffix === ''
      ? 1
      : units[suffix]);
  }

  if (!(total > 0)) {
    throw new Error(`${what} must be greater than zero, got "${text}"`);
  }

  return Math.floor(total);
};

/** "memory, 24h, 1000, 10Mb" -> { store, retentionMs, count, quotaBytes }. */
const parsePolicy = text =>
{
  if (typeof text !== 'string') {
    throw new Error('policy must be a string');
  }

  const fields = text.split(',').map(field => field.trim());
  if (fields.length !== 4) {
    throw new Error(
      `expected "<store>, <retention>, <count>, <quota>", got "${text}"`
    );
  }

  const [store, retention, count, quota] = fields;
  if (!STORES.has(store.toLowerCase())) {
    throw new Error(`unknown store "${store}", expected memory or database`);
  }

  return {
    store: store.toLowerCase(),
    retentionMs: parseAmount(retention, SECONDS, 'retention') * 1000,
    count: parseAmount(count, COUNTS, 'count'),
    quotaBytes: parseAmount(quota, BYTES, 'quota')
  };
};

// --- config ----------------------------------------------------------------

const readFile = () =>
{
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    console.error(`samples.json: ${error.message}`);
    return {};
  }
};

const compile = raw =>
{
  const defaults = raw.default ?? DEFAULT_POLICY;
  let fallback;

  try {
    fallback = parsePolicy(defaults);
  } catch (error) {
    console.error(`samples.json default: ${error.message}`);
    fallback = parsePolicy(DEFAULT_POLICY);
  }

  const keys = new Map();
  for (const [key, text] of Object.entries(raw.keys ?? {})) {
    try {
      keys.set(key, parsePolicy(text));
    } catch (error) {
      console.error(`samples.json ${key}: ${error.message}`);
    }
  }

  return { fallback, keys };
};

// Loaded once at startup, then reloaded when samples.json changes on disk.
let current = compile(readFile());

const load = () =>
{
  current = compile(readFile());
  return current;
};

// Editors replace the file rather than write into it, so watch the directory and
// filter by name; a rename still fires here where a file watch would go deaf.
let watcher = null;
let pending = null;

const watch = () =>
{
  if (watcher) {
    return watcher;
  }

  try {
    watcher = fs.watch(path.dirname(configPath), (event, filename) =>
    {
      if (filename && filename !== path.basename(configPath)) {
        return;
      }
      // Saves arrive as a burst of events; settle before re-reading.
      clearTimeout(pending);
      pending = setTimeout(() =>
      {
        load();
        console.log(`samples.json reloaded (${current.keys.size} keys)`);
      }, 100);
      pending.unref?.();
    });
    watcher.unref?.();
  } catch (error) {
    console.error(`samples.json watch failed: ${error.message}`);
  }

  return watcher;
};

/** The policy in force for a key: its own entry, or the configured default. */
const policyFor = key => current.keys.get(key) ?? current.fallback;

export {
  configPath,
  DEFAULT_POLICY,
  load,
  parseAmount,
  parsePolicy,
  policyFor,
  watch
};
