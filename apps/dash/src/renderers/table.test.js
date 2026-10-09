import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import table from './table.js';

const cells = (body, selector) =>
  [...body.querySelectorAll('tr')]
    .map(row => [...row.querySelectorAll(selector)].map(cell => cell.textContent))
    .filter(row => row.length > 0);

test('table draws the fields of the first row as columns when none are given', () =>
{
  using dom = useDom();

  const body = dom.body();
  table(body, [{ name: 'cpu', value: 12 }, { name: 'ram', value: 40 }]);

  assert.deepEqual(cells(body, 'th'), [['name', 'value']]);
  assert.deepEqual(cells(body, 'td'), [['cpu', '12'], ['ram', '40']]);
});

test('table takes columns as names or as fields with labels, and limits the rows', () =>
{
  using dom = useDom();

  const body = dom.body();
  table(body, { rows: [{ p: { name: 'node' }, cpu: 3 }, { cpu: 1 }] }, {
    field: 'rows',
    columns: [{ field: 'p.name', label: 'Process' }, 'cpu'],
    limit: 1
  });

  assert.deepEqual(cells(body, 'th'), [['Process', 'cpu']]);
  assert.deepEqual(cells(body, 'td'), [['node', '3']]);
});

test('table draws its empty message for no rows', () =>
{
  using dom = useDom();

  const body = dom.body();
  table(body, [], { empty: 'idle' });

  assert.equal(body.textContent, 'idle');
});
