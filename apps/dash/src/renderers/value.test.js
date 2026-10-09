import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import value from './value.js';

test('value draws one number with its prefix, unit and precision', () =>
{
  using dom = useDom();

  const body = dom.body();
  value(body, { freePercent: 41.27 }, {
    field: 'freePercent',
    unit: '%',
    prefix: '~',
    precision: 1
  });

  assert.equal(
    body.innerHTML,
    '<p class="hero"><span class="affix">~</span><span class="hero-number">41.3</span><span class="affix">%</span></p>'
  );
});

test('value draws a word as it is, and an empty value as no data', () =>
{
  using dom = useDom();

  const body = dom.body();
  value(body, 'online');
  assert.equal(body.querySelector('.hero-number').textContent, 'online');

  value(body, '');
  assert.equal(body.textContent, 'no data');

  value(body, { other: 1 }, { field: 'missing' });
  assert.equal(body.textContent, 'no data');
});
