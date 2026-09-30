// Sample persistence policy syntax. See docs/concept.md section 5.
//
// A policy is one line, carried by a counter in its project config:
//
//     "ping.gw": { "samples": "memory, 24h, 1000, 10Mb" }
//                             store,  retention, count, quota
//
// All four fields are required and must be positive. There is no unlimited option:
// every key is bounded in time, in record count and in bytes. Which policy applies to
// which key is config.js's business; this module only reads the syntax.

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

export {
  DEFAULT_POLICY,
  parseAmount,
  parsePolicy
};
