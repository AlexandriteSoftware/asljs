// The five-field cron expression a counter schedules with, and when it next fires.
// Shared by the runner, which ticks on it, and the server, which reports the wait.
// See docs/monitors.md, "The counter".

const RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

/** Expand one cron field into a Set of matching numbers. Supports * , - and /n. */
const expand = (spec, [lo, hi]) =>
{
  const values = new Set();

  for (const part of spec.split(',')) {
    const [range, stepText] = part.split('/');
    const step = stepText
      ? Number(stepText)
      : 1;
    if (!Number.isInteger(step) || step < 1) {
      throw new Error(`bad step in "${part}"`);
    }

    let start = lo;
    let end = hi;
    if (range !== '*') {
      const [from, to] = range.split('-');
      start = Number(from);
      end = to === undefined
        ? (stepText
          ? hi
          : start)
        : Number(to);
    }
    if (
      !Number.isInteger(start)
      || !Number.isInteger(end)
      || start < lo
      || end > hi
    ) {
      throw new Error(`bad range in "${part}"`);
    }

    for (let value = start; value <= end; value += step) {
      values.add(value);
    }
  }

  return values;
};

const parse = expression =>
{
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`expected 5 cron fields, got ${fields.length}`);
  }
  return fields.map((field, index) => expand(field, RANGES[index]));
};

/** Day of month, month and day of week — the fields that pick the day. */
const matchesDay = (cron, date) =>
{
  const dow = date.getDay();
  return cron[2].has(date.getDate())
    && cron[3].has(date.getMonth() + 1)
    && (cron[4].has(dow) || (dow === 0 && cron[4].has(7)));
};

const matches = (cron, date) =>
  cron[0].has(date.getMinutes())
  && cron[1].has(date.getHours())
  && matchesDay(cron, date);

// A schedule can be sparse — one minute a year — so the search skips whole days and
// whole hours that cannot match instead of walking every minute of them.
const HORIZON_DAYS = 366 * 4;

/**
 * The first minute strictly after `from` that the schedule matches, or null when it
 * matches no minute within four years. Local time, as the runner's tick is.
 */
const next = (cron, from = new Date()) =>
{
  const date = new Date(from);
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + 1);

  const limit = new Date(date);
  limit.setDate(limit.getDate() + HORIZON_DAYS);

  while (date <= limit) {
    if (!matchesDay(cron, date)) {
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
      continue;
    }
    if (!cron[1].has(date.getHours())) {
      date.setHours(date.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!cron[0].has(date.getMinutes())) {
      date.setMinutes(date.getMinutes() + 1);
      continue;
    }
    return date;
  }

  return null;
};

/**
 * The last minute at or before `from` that the schedule matched, or null when it
 * matched no minute in the four years before it. The counterpart of `next`: the
 * minute the counter was last expected to run.
 */
const previous = (cron, from = new Date()) =>
{
  const date = new Date(from);
  date.setSeconds(0, 0);

  const limit = new Date(date);
  limit.setDate(limit.getDate() - HORIZON_DAYS);

  while (date >= limit) {
    if (!matchesDay(cron, date)) {
      date.setDate(date.getDate() - 1);
      date.setHours(23, 59, 0, 0);
      continue;
    }
    if (!cron[1].has(date.getHours())) {
      date.setHours(date.getHours() - 1, 59, 0, 0);
      continue;
    }
    if (!cron[0].has(date.getMinutes())) {
      date.setMinutes(date.getMinutes() - 1);
      continue;
    }
    return date;
  }

  return null;
};

export {
  matches,
  next,
  parse,
  previous
};
