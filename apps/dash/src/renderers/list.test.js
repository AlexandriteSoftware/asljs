import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import list from './list.js';

const rowsOf = body =>
  [...body.querySelectorAll('li')].map(item =>
    [...item.children].map(span => span.textContent)
  );

test('list draws a row per item, its label and the other fields that are set', () =>
{
  using dom = useDom();

  const body = dom.body();
  list(body, [
    { title: 'Dentist', when: '2026-10-12', where: '' },
    { title: 'Car <MOT>', when: '2026-10-14', where: 'Garage' }
  ], { fields: ['title', 'when', 'where'] });

  assert.deepEqual(rowsOf(body), [
    ['Dentist', '2026-10-12'],
    ['Car <MOT>', '2026-10-14', 'Garage']
  ]);
});

test('list limits the rows and says how many more there are', () =>
{
  using dom = useDom();

  const body = dom.body();
  list(body, { items: ['a', 'b', 'c'] }, { field: 'items', limit: 2 });

  assert.deepEqual(rowsOf(body), [['a'], ['b']]);
  assert.equal(body.querySelector('.note').textContent, '+1 more');
});

test('list draws its empty message for no rows', () =>
{
  using dom = useDom();

  const body = dom.body();
  list(body, []);
  assert.equal(body.textContent, 'nothing');

  list(body, 'not a list', { empty: 'all done' });
  assert.equal(body.textContent, 'all done');
});
