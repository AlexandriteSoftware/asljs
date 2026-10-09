import assert from 'node:assert/strict';
import test from 'node:test';
import {
  matches,
  next,
  parse,
  previous
} from './cron.js';

// Local time, as the runner ticks: month is 0-based in the Date constructor.
const at = (year, month, day, hours = 0, minutes = 0, seconds = 0) =>
  new Date(year, month - 1, day, hours, minutes, seconds);

test('parse expands *, lists, ranges and steps per field', () =>
{
  const [minutes, hours, days, months, weekdays] = parse(
    '*/15 1-3,22 1 */6 1-5'
  );

  assert.deepEqual([...minutes], [0, 15, 30, 45]);
  assert.deepEqual([...hours], [1, 2, 3, 22]);
  assert.deepEqual([...days], [1]);
  assert.deepEqual([...months], [1, 7]);
  assert.deepEqual([...weekdays], [1, 2, 3, 4, 5]);

  assert.deepEqual([...parse('10/20 * * * *')[0]], [10, 30, 50]);
});

test('parse rejects a wrong field count, a bad step and an out-of-range value', () =>
{
  assert.throws(() => parse('* * * *'), /expected 5 cron fields, got 4/);
  assert.throws(() => parse('*/0 * * * *'), /bad step in "\*\/0"/);
  assert.throws(() => parse('60 * * * *'), /bad range in "60"/);
  assert.throws(() => parse('* 24 * * *'), /bad range in "24"/);
  assert.throws(() => parse('* * 0 * *'), /bad range in "0"/);
  assert.throws(() => parse('* * * 13 *'), /bad range in "13"/);
  assert.throws(() => parse('* * * * x'), /bad range in "x"/);
});

test('matches checks the minute, the hour and the day, with 0 and 7 both Sunday', () =>
{
  const weekdayMornings = parse('30 9 * * 1-5');

  // 2026-10-09 is a Friday.
  assert.equal(matches(weekdayMornings, at(2026, 10, 9, 9, 30)), true);
  assert.equal(matches(weekdayMornings, at(2026, 10, 9, 9, 31)), false);
  assert.equal(matches(weekdayMornings, at(2026, 10, 9, 10, 30)), false);
  assert.equal(matches(weekdayMornings, at(2026, 10, 10, 9, 30)), false);

  // 2026-10-11 is a Sunday.
  assert.equal(matches(parse('0 0 * * 7'), at(2026, 10, 11)), true);
  assert.equal(matches(parse('0 0 * * 0'), at(2026, 10, 11)), true);
  assert.equal(matches(parse('0 0 * * 7'), at(2026, 10, 12)), false);
});

test('next is the first matching minute strictly after the given time', () =>
{
  const everyFive = parse('*/5 * * * *');

  assert.deepEqual(next(everyFive, at(2026, 10, 9, 12, 0)), at(2026, 10, 9, 12, 5));
  assert.deepEqual(
    next(everyFive, at(2026, 10, 9, 12, 4, 59)),
    at(2026, 10, 9, 12, 5)
  );
  assert.deepEqual(
    next(everyFive, at(2026, 10, 9, 23, 58)),
    at(2026, 10, 10, 0, 0)
  );
});

test('next skips the days and hours that cannot match, across months and years', () =>
{
  assert.deepEqual(
    next(parse('0 6 * * *'), at(2026, 10, 9, 6, 0)),
    at(2026, 10, 10, 6, 0)
  );
  assert.deepEqual(
    next(parse('15 3 1 * *'), at(2026, 10, 9)),
    at(2026, 11, 1, 3, 15)
  );
  assert.deepEqual(
    next(parse('0 0 1 1 *'), at(2026, 10, 9)),
    at(2027, 1, 1)
  );
  // 2026-10-09 is a Friday, so the next Monday is the 12th.
  assert.deepEqual(
    next(parse('0 9 * * 1'), at(2026, 10, 9, 10)),
    at(2026, 10, 12, 9, 0)
  );
  assert.deepEqual(
    next(parse('0 0 29 2 *'), at(2026, 10, 9)),
    at(2028, 2, 29)
  );
});

test('next and previous are null for a schedule that never matches', () =>
{
  const never = parse('0 0 31 2 *');

  assert.equal(next(never, at(2026, 10, 9)), null);
  assert.equal(previous(never, at(2026, 10, 9)), null);
});

test('previous is the last matching minute at or before the given time', () =>
{
  const everyFive = parse('*/5 * * * *');

  assert.deepEqual(
    previous(everyFive, at(2026, 10, 9, 12, 5, 30)),
    at(2026, 10, 9, 12, 5)
  );
  assert.deepEqual(
    previous(everyFive, at(2026, 10, 9, 12, 9)),
    at(2026, 10, 9, 12, 5)
  );
  assert.deepEqual(
    previous(everyFive, at(2026, 10, 10, 0, 3)),
    at(2026, 10, 10, 0, 0)
  );
  assert.deepEqual(
    previous(parse('45 23 * * *'), at(2026, 10, 10, 0, 3)),
    at(2026, 10, 9, 23, 45)
  );
  assert.deepEqual(
    previous(parse('0 0 1 1 *'), at(2026, 10, 9)),
    at(2026, 1, 1)
  );
  // 2026-10-09 is a Friday, so the last Monday at 9:00 was the 5th.
  assert.deepEqual(
    previous(parse('0 9 * * 1'), at(2026, 10, 9, 8)),
    at(2026, 10, 5, 9, 0)
  );
});
