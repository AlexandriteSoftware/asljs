import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import {
  asNumber,
  clear,
  el,
  empty,
  field,
  formatNumber
} from './util.js';

test('el builds an element whose text is escaped by construction', () =>
{
  using dom = useDom();

  const node = el('p', 'note', '<b>bold</b>');

  assert.equal(node.ownerDocument, dom.document);

  assert.equal(node.outerHTML, '<p class="note">&lt;b&gt;bold&lt;/b&gt;</p>');
  assert.equal(el('span').outerHTML, '<span></span>');
  assert.equal(el('span', null, 0).textContent, '0');
});

test('clear and empty replace what a card body holds', () =>
{
  using dom = useDom();

  const body = dom.body();
  body.append(el('p', null, 'old'));

  empty(body);
  assert.equal(body.innerHTML, '<p class="empty">no data</p>');

  empty(body, 'nothing yet');
  assert.equal(body.innerHTML, '<p class="empty">nothing yet</p>');

  clear(body);
  assert.equal(body.innerHTML, '');
});

test('field reads a dotted path, and gives the value itself without a name', () =>
{
  const value = { disk: { free: 41.3 }, list: [{ label: 'a' }] };

  assert.equal(field(value, 'disk.free'), 41.3);
  assert.equal(field(value, 'list.0.label'), 'a');
  assert.equal(field(value, 'disk.missing.deeper'), undefined);
  assert.equal(field(value), value);
  assert.equal(field('bare', ''), 'bare');
});

test('asNumber parses numbers and numeric text, and gives null otherwise', () =>
{
  assert.equal(asNumber(4), 4);
  assert.equal(asNumber('41.3'), 41.3);
  assert.equal(asNumber('12ms'), 12);
  assert.equal(asNumber('online'), null);
  assert.equal(asNumber(Number.NaN), null);
  assert.equal(asNumber(null), null);
});

test('formatNumber keeps integers, rounds to two places, or uses the precision given', () =>
{
  assert.equal(formatNumber(42), '42');
  assert.equal(formatNumber(3.14159), '3.14');
  assert.equal(formatNumber(3.14159, 1), '3.1');
  assert.equal(formatNumber(2, 2), '2.00');
});
