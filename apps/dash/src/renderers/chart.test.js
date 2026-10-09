import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import chart from './chart.js';

/** Sticky samples, newest first, as `/api/history` returns them. */
const HISTORY = [
  { ts: 3000, seen: 4000, value: '{"ms":30}' },
  { ts: 2000, seen: 2000, value: 'not a number' },
  { ts: 1000, seen: 1500, value: '{"ms":10}' }
];

/** Draws the chart and waits for the history it asks for. */
const draw = async (body, params, samples = HISTORY) =>
{
  const asked = [];
  chart(body, null, params, {
    history: async options =>
    {
      asked.push(options);
      return samples;
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  return asked;
};

test('chart asks for its history, and steps each value forward to the next sample', async () =>
{
  using dom = useDom();

  const body = dom.body();
  const asked = await draw(body, { field: 'ms', limit: 50 });

  assert.deepEqual(asked, [{ limit: 50, since: undefined }]);

  const svg = body.querySelector('svg');
  assert.equal(svg.getAttribute('aria-label'), '2 samples, latest 30');

  // Width 120, plot from x 34 to 112 over ts 1000..4000; values 0..30 over
  // y 8..44 (the floor drops to zero). The line holds 10 from ts 1000 to the
  // next sample at 3000, then 30 until the newest sample's seen at 4000.
  assert.equal(
    body.querySelector('.chart-line').getAttribute('d'),
    'M 34 32 L 86 32 L 86 8 L 112 8'
  );
  assert.deepEqual(
    [...body.querySelectorAll('.chart-tick')].map(tick => tick.textContent),
    ['30', '0']
  );
});

test('chart draws a bar per sample with kind bar', async () =>
{
  using dom = useDom();

  const body = dom.body();
  await draw(body, { field: 'ms', kind: 'bar' });

  assert.equal(body.querySelectorAll('.chart-bar').length, 2);
  assert.equal(body.querySelector('.chart-line'), null);
});

test('chart draws no history without numbers, a history, or when it fails', async () =>
{
  using dom = useDom();

  const body = dom.body();
  await draw(body, { field: 'ms' }, [{ ts: 1, seen: 1, value: 'text' }]);
  assert.equal(body.textContent, 'no history');

  chart(body, null, {});
  assert.equal(body.textContent, 'no history');

  const failing = dom.body();
  chart(failing, null, {}, {
    history: async () =>
    {
      throw new Error('offline');
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(failing.textContent, 'no history');
});
